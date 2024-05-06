import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
    console.log("It works");
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users); //check if we can get all user information, this is how we get data using prisma
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get users"})
    }
}

export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: {id: id},
        });
        res.status(200).json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get users"})
    }
}



export const updateUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const {password, avatar, ...inputs} = req.body;

    if (id !== tokenUserId){
        return res.status(403).json({message: "Not Authorized!"});
    }

    let updatedPassword = null;

    try {
        if (password){
            updatedPassword = await bcrypt.hash(password, 10);
        }
        const updatedUser = await prisma.user.update({
            where: {id},
            data: {
                ...inputs,
                ...(updatedPassword && {password: updatedPassword}),
                ...(avatar && {avatar: avatar}),
            },
        });

        const {password: userPassword, ...rest} = updatedUser

        res.status(200).json(rest);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get users"})
    }
}


export const deleteUser = async (req, res) => {

    const id = req.params.id;
    const tokenUserId = req.userId;

    if (id !== tokenUserId){
        return res.status(403).json({message: "Not Authorized!"});
    }

    try {
        await prisma.user.delete({
            where: {id},
        });
        res.status(200).json({message: "User Deleted"});
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get users"})
    }
}

export const savePost = async (req, res) => {

    const postId = req.body.postId;
    const tokenUserId = req.userId;

    try {

        const savedPost = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId: tokenUserId,
                    postId: postId,
                },
            },
        });

        if(savedPost){
            await prisma.savedPost.delete({
                where: {
                    id: savedPost.id,
                },
            });
            res.status(200).json({message: "Post removed from saved list"});
        } else {
            await prisma.savedPost.create({
                data: {
                    userId: tokenUserId,
                    postId: postId,
                },
            });
            res.status(200).json({message: "Post saved"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get users"})
    }
};

export const profilePosts = async (req, res) => {
    const tokenUserId = req.params.userId;
    try {
        const userPosts = await prisma.post.findMany({
            where: {userId: tokenUserId},
        });
        const saved = await prisma.savedPost.findMany({
            where: {userId: tokenUserId},
            include: {
                post: true,
            },
        });

        const savedPosts = saved.map(item=>item.post)
        res.status(200).json({userPosts, savedPosts});
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get profile posts"})
    }
}

export const getNotificationNumber = async (req, res) => {
    const userId = req.userId;
    try {
        const number = await prisma.chat.count({
            where: {
                userIDs: {
                    hasSome: [userId],
                },
                NOT: {
                    seenBy: {
                        hasSome: [userId],
                    },
                },
            },
        });
        res.status(200).json(number);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get profile posts"})
    }
}
