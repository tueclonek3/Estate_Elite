import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({ chats, activeChat }) {
  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef(null);
  const decrease = useNotificationStore((state) => state.decrease);

  // Set active chat when passed as prop
  useEffect(() => {
    if (activeChat) {
      setChat(activeChat);
    }
  }, [activeChat]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);
      if (!res.data.seenBy.includes(currentUser.id)) {
        decrease();
      }
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text) return;

    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
        lastMessage: text,
      }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id);
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setChat((prev) => ({
            ...prev,
            messages: [...prev.messages, data],
            lastMessage: data.text,
          }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  return (
    <div className={`chat ${!chats ? 'full-width' : ''}`}>
      {chats && (
        <div className="messages">
          <h1>Messages</h1>
          {chats?.map((c) => (
            <div
              className="message"
              key={c.id}
              style={{
                backgroundColor:
                  c.seenBy.includes(currentUser.id) || chat?.id === c.id
                    ? "white"
                    : "#feed514e",
              }}
              onClick={() => handleOpenChat(c.id, c.receiver)}
            >
              <img src={c.receiver.avatar || "/noavatar.jpg"} alt="" />
              <span>{c.receiver.username}</span>
              <p>{c.lastMessage}</p>
            </div>
          ))}
        </div>
      )}
      
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="" />
              {chat.receiver.username}
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
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
                          : chat.receiver.avatar || "/noavatar.jpg"
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
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;