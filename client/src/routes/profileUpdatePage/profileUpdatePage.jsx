import { useContext, useState } from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget";

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState([]);
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    const formData = new FormData(e.target);

    const { displayName, email, newPassword, confirmPassword } =
      Object.fromEntries(formData);

    // Password validation
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    try {
      const res = await apiRequest.put(`/users/${currentUser.id}`, {
        displayName,
        email,
        ...(newPassword && { newPassword }),
        ...(confirmPassword && { confirmPassword }),
        ...(avatar.length > 0 && { avatar: avatar[0] }),
      });
      updateUser(res.data);

      // If password was changed, log user out
      if (newPassword) {
        // Clear user context and localStorage
        updateUser(null);
        localStorage.removeItem("user");

        // Redirect to login page with success message
        navigate("/login", {
          state: {
            message: "Password updated successfully. Please login again.",
          },
        });
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="profileUpdatePage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Update Profile</h1>
          <div className="item">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={currentUser.displayName}
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
            <label htmlFor="newPassword">New Password</label>
            <input id="newPassword" name="newPassword" type="password" />
          </div>
          <div className="item">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
            />
            {passwordError && <span className="error">{passwordError}</span>}
          </div>
          <button>Update</button>
          {error && <span>error</span>}
        </form>
      </div>
      <div className="sideContainer">
        <img
          src={avatar[0] || currentUser.avatar || "/noavatar.jpg"}
          alt=""
          className="avatar"
        />
        <UploadWidget
          uwConfig={{
            cloudName: "dnyu5pmrn",
            uploadPreset: "estate",
            multiple: false,
            maxImageFileSize: 2000000,
            folder: "avatars",
          }}
          setState={setAvatar}
        />
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
