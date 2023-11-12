import React from "react";
import "../../src/chats.css";
import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../slices/chatSlice";

const UserChat = () => {
  const [socket, setSocket] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const chat = useSelector(
    (state) => state.chat.chatRooms[userInfo?._id] || { messages: [] }
  );

  const [messageReceived, setMessageReceived] = useState(false);

  useEffect(() => {
    if (userInfo && !userInfo?.isAdmin) {
      const socket = socketIOClient();

      socket.emit("join room", userInfo?._id);

      // Listening to messages sent by admin to this user
      socket.on("admin sends message", (data) => {
        dispatch(
          addMessage({
            userId: data.userId,
            message: {
              sender: "admin",
              content: data.message,
              createdAt: new Date().toISOString(),
            },
          })
        );
        setMessageReceived(true);
      });

      setSocket(socket);

      return () => socket.disconnect();
    }
  }, [userInfo, dispatch]);

  const clientSubmitChatMsg = (e) => {
    if (e.keyCode && e.keyCode !== 13) {
      return;
    }
    setMessageReceived(false);
    const msg = document.getElementById("clientChatMsg");

    let messageText = msg.value.trim();
    if (messageText) {
      const message = {
        userId: userInfo._id,
        userName: userInfo.name,
        message: messageText,
        sender: "user",
      };

      socket.emit("client sends message", message);

      dispatch(
        addMessage({
          userId: userInfo._id,
          message: {
            sender: "user",
            content: messageText,
            createdAt: new Date().toISOString(),
          },
        })
      );

      msg.focus();
      setTimeout(() => {
        msg.value = "";
        const chatMessage = document.querySelector(".cht-msg");
        chatMessage.scrollTop = chatMessage.scrollHeight;
      }, 200);
    }
  };

  return !userInfo?.isAdmin ? (
    <>
      <input type="checkbox" id="check" />
      <label className="chat-btn" htmlFor="check">
        <i className="bi bi-chat-dots comment"></i>
        {messageReceived && (
          <span className="position-absolute top-0 start-10 translate-middle p-2 bg-danger border border-light rounded-circle"></span>
        )}
        <i className="bi bi-x-circle close"></i>
      </label>
      <div className="chat-wrapper">
        <div className="chat-header">
          <h6>Let's Chat - Online</h6>
        </div>
        <div className="chat-form">
          <div className="cht-msg">
            {chat.messages.map((item, id) => (
              <div key={id}>
                <p
                  className={
                    item.sender === "admin"
                      ? "bg-primary p-3 ms-4 text-light rounded-pill"
                      : ""
                  }
                >
                  <b>{item.sender === "admin" ? "Support" : "You"} wrote:</b>{" "}
                  {item.content}
                </p>
              </div>
            ))}
          </div>

          <textarea
            onKeyUp={(e) => clientSubmitChatMsg(e)}
            id="clientChatMsg"
            className="form-control"
            placeholder="Your Text Message"
          ></textarea>

          <button
            onClick={(e) => clientSubmitChatMsg(e)}
            className="btn btn-success btn-block"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  ) : null;
};

export default UserChat;
