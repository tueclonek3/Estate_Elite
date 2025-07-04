import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  
  // New state for chat functionality
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
    }

    if (currentUser.id === post.userId) {
      alert("You cannot save your own post.");
      return;
    }

    // AFTER REACT 19 UPDATE TO USEOPTIMISTIC HOOK
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  // New function to handle message button click
  const handleMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.id === post.userId) {
      alert("You cannot message yourself");
      return;
    }

    try {
      // Check if chat already exists
      const res = await apiRequest.post("/chats/getOrCreate", {
        receiverId: post.userId
      });
      
      setActiveChat({
        ...res.data,
        receiver: {
          id: post.userId,
          username: post.user.displayName,
          avatar: post.user.avatar
        }
      });
      
      setChatOpen(true);
      
      // Fetch chat messages
      const chatRes = await apiRequest.get(`/chats/${res.data.id}`);
      setMessages(chatRes.data.messages);
    } catch (err) {
      console.log(err);
      alert("Failed to start chat");
    }
  };

  // New function to send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await apiRequest.post(`/messages/${activeChat.id}`, {
        text: newMessage
      });
      
      setMessages([...messages, res.data]);
      setNewMessage("");
      
      // Send via socket
      socket.emit("sendMessage", {
        receiverId: activeChat.receiver.id,
        data: res.data
      });
      
      // Update last message
      setActiveChat(prev => ({
        ...prev,
        lastMessage: newMessage
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // Socket message listener
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (activeChat && activeChat.id === data.chatId) {
        setMessages(prev => [...prev, data]);
      }
    };

    socket.on("getMessage", handleReceiveMessage);

    return () => {
      socket.off("getMessage", handleReceiveMessage);
    };
  }, [activeChat, socket]);

  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar || "/noavatar.jpg"} alt="" />
                <span>{post.user.displayName}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + "km"
                    : post.postDetail.school + "m"}{" "}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/bus.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/restaurant.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button onClick={handleMessage}>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Window */}
      {chatOpen && (
        <div className="chatWindow">
          <div className="top">
            <span>{post.user.displayName}</span>
            <button className="close" onClick={() => setChatOpen(false)}>
              X
            </button>
          </div>
          <div className="center">
            {messages.map((message) => (
              <div
                className={`chatMessage ${
                  message.userId === currentUser.id ? "own" : ""
                }`}
                key={message.id}
              >
                <div className="texts">
                  {message.userId !== currentUser.id && (
                    <img
                      src={
                        message.userId === currentUser.id
                          ? currentUser.avatar || "/noavatar.jpg"
                          : post.user.avatar || "/noavatar.jpg"
                      }
                      alt=""
                    />
                  )}
                  <div className="messageContent">
                    <p>{message.text}</p>
                    <span>{format(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form className="bottom" onSubmit={sendMessage}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            ></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SinglePage;