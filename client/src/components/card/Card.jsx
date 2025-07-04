import { Link, useNavigate } from "react-router-dom";
import "./card.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function Card({ item }) {
  const { currentUser } = useContext(AuthContext);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(item.price);
  const [showHistory, setShowHistory] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const navigate = useNavigate();

  const fetchPriceHistory = async (e) => {
    e.stopPropagation();
    if (!currentUser || currentUser.id !== item.userId) return;

    try {
      const res = await apiRequest.get(`/posts/${item.id}/history`);
      setPriceHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch price history");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!currentUser || currentUser.id !== item.userId) return;

    try {
      await apiRequest.delete(`/posts/${item.id}`);
      alert("Post deleted successfully!");
      window.location.reload();
    } catch (err) {
      console.log(err);
      alert("Failed to delete post");
    }
  };

  // NEW FUNCTION: Handle navigation to edit page
  const handleEdit = (e) => {
    e.stopPropagation();
    if (!currentUser || currentUser.id !== item.userId) return;
    navigate(`/edit/${item.id}`);
  };

  const handleUpdate = async (e) => {
    e.stopPropagation();
    if (!currentUser || currentUser.id !== item.userId) return;

    if (editing) {
      try {
        await apiRequest.put(`/posts/${item.id}`, {
          price: parseInt(newPrice),
        });
        alert("Price updated successfully!");
        setEditing(false);
      } catch (err) {
        console.log(err);
        alert("Failed to update price");
      }
    } else {
      setEditing(true);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    if (currentUser.id == item.userId) {
      alert("You cannot save your own post.");
      return;
    }

    try {
      await apiRequest.post("/users/save", { postId: item.id });
      setSaved(!saved);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        {!editing ? (
          <p className="price">${item.price}</p>
        ) : (
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            onBlur={handleUpdate}
            autoFocus
          />
        )}
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            {currentUser && currentUser.id === item.userId && (
              <>
                <div className="icon" onClick={handleDelete}>
                  <img src="/bin.png" alt="Delete" />
                </div>
                {/* EDIT BUTTON ADDED HERE */}
                <div className="icon" onClick={handleEdit}>
                  <img src="/update.png" alt="Edit" />
                </div>
                <div className="icon" onClick={fetchPriceHistory}>
                  <img src="/dollar.png" alt="History" />
                </div>
              </>
            )}
          </div>

          {showHistory && (
            <div className="history-modal">
              <h3>Price History</h3>
              <ul>
                {priceHistory.map((record, index) => (
                  <li key={index}>
                    {new Date(record.date).toLocaleDateString()}: $
                    {record.price}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowHistory(false)}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;