import { useContext, useState } from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget";

function ProfileUpdatePage() {
  const {currentUser, updateUser} = useContext(AuthContext);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const navigate = useNavigate();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);

    const {username, email, password} = Object.fromEntries(formData);

    try{

      //from apiRequest.js
      const res = await apiRequest.put(`/users/${currentUser.id}`, 
      {
        username, 
        email, 
        password,
        avatar,
      });
      //console.log(res.data);
      updateUser(res.data);
      navigate("/profile");
    }catch (err) {
      console.log(err);
      setError(err.response.data.message);
    }
  }

  return (
    <div className="profileUpdatePage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Update Profile</h1>
          <div className="item">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text" 
              defaultValue={currentUser.username}
            />
          </div>
          <div className="item">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={currentUser.email}
            />
          </div>
          <div className="item">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" />
          </div>
          <button>Update</button>
          {error && <span>error</span>}
        </form>
      </div>
      <div className="sideContainer">
        <img src={avatar || "/noavatar.jpg"} alt="" className="avatar" />
        <UploadWidget uwConfig={{
          cloudName: "dv1zaceus",
          uploadPreset: "estate",
          multiple: false,
          maxImageFileSize: 2000000,
          folder: "avatars",
        }} setAvatar={setAvatar}
        />
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
