import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { addMessage } from "../slices/chatSlice";
// import { useGetChatHistoryQuery } from "../slices/apiSlice";
import {
  clearMessageReceived,
  setMessageReceived,
} from "../slices/unreadMessagesSlice";
import "../../src/chats.css";
import { Button, Toast, Form } from "react-bootstrap";

const AdminChat = () => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const chatRooms = useSelector((state) => state.chat.chatRooms);
  const userId = useSelector((state) => state.auth.userInfo._id);
  const [showChat, setShowChat] = useState({});
  const messageContainers = useRef({});

  useEffect(() => {
    const socket = socketIOClient();

    // socket.on("user sends message", (data) => {
    //   dispatch(addMessage({ userId: data.userId, message: data.message }));
    // });
    socket.on("server sends message from client to admin", (data) => {
      //   dispatch(
      //     addMessage({ userId: data.userId, message: { user: data.message } })
      //   );
      dispatch(
        addMessage({
          userId: data.userId,
          userName: data.userName,
          message: {
            sender: "user",
            content: data.message,
            createdAt: new Date().toISOString(),
          },
        })
      );

      // Dispatch action to set message as unread
      dispatch(setMessageReceived({ userId: data.userId }));
    });

    setSocket(socket);

    return () => socket.disconnect();
  }, [dispatch]);

  const adminSubmitChatMsg = (userId, messageText) => {
    if (!messageText || !userId) {
      return;
    }

    // socket.emit("admin sends message", { userId, message });
    // dispatch(addMessage({ userId, message: { admin: message } }));
    const message = {
      userId,
      userName: "", // userName isn't necessary for admin messages
      message: messageText,
      sender: "admin",
    };

    socket.emit("admin sends message", message);

    dispatch(
      addMessage({
        userId,
        message: {
          sender: "admin",
          content: messageText,
          createdAt: new Date().toISOString(),
        },
      })
    );

    // Clear the unread message indicator
    dispatch(clearMessageReceived({ userId }));

    // Clear the textarea after sending the message
    const messageInput = document.getElementById(`messageInput-${userId}`);
    if (messageInput) {
      messageInput.value = "";
    }
  };

  const handleKeyPress = (e, userId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = e.target.value.trim();
      if (message) {
        adminSubmitChatMsg(userId, message);
      }
    }
  };

  // const messageContainers = useRef({});
  // useEffect(() => {
  //   Object.keys(chatRooms).forEach((userId) => {
  //     const messageContainer = messageContainers.current[userId];
  //     if (messageContainer) {
  //       messageContainer.scrollTop = messageContainer.scrollHeight;
  //     }
  //   });
  // }, [chatRooms]);
  ////
  //

  // Toggle the visibility of a chat room
  const toggleChat = (userId) => {
    setShowChat((prevShowChat) => ({
      ...prevShowChat,
      [userId]: !prevShowChat[userId],
    }));
  };

  // Function to scroll to the bottom of the chat
  const scrollToBottom = (userId) => {
    const messageContainer = messageContainers.current[userId];
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  };

  // useEffect(() => {
  //   Object.keys(chatRooms).forEach((userId) => {
  //     setShowChat((prevShowChat) => ({
  //       ...prevShowChat,
  //       [userId]: true, // Initialize all chats as visible
  //     }));
  //   });
  // }, [chatRooms]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    Object.keys(chatRooms).forEach((userId) => {
      scrollToBottom(userId);
    });
  }, [chatRooms]); // Re-run this effect when chatRooms changes

  //   return (
  //     <div className="admin-chat-container">
  //       {Object.keys(chatRooms).map((userId) => (
  //         <div key={userId} className="chat-room">
  //           <h3>Chat with User {chatRooms[userId].userName}</h3>
  //           <div className="cht-msg">
  //             {chatRooms[userId].messages.map((msg, index) => (
  //               <div
  //                 key={index}
  //                 // className={msg.sender === "admin" ? "admin-msg" : "user-msg"}
  //                 className={
  //                   msg.sender === "admin" ? "admin-message" : "user-message"
  //                 }
  //               >
  //                 <p>
  //                   <b>
  //                     {msg.sender === "admin"
  //                       ? "You"
  //                       : chatRooms[userId].userName || `User ${userId}`}{" "}
  //                     wrote:
  //                   </b>{" "}
  //                   {msg.content}
  //                 </p>
  //               </div>
  //             ))}
  //           </div>
  //           <textarea
  //             id={`messageInput-${userId}`}
  //             className="form-control"
  //             onKeyUp={(e) => handleKeyPress(e, userId)}
  //             placeholder="Type your message here..."
  //           />
  //           <button
  //             onClick={() =>
  //               adminSubmitChatMsg(
  //                 userId,
  //                 document.getElementById(`messageInput-${userId}`).value
  //               )
  //             }
  //             className="btn btn-success btn-block"
  //           >
  //             Send
  //           </button>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };
  return (
    <div className="admin-chat-container">
      {Object.keys(chatRooms).map((userId) => (
        <Toast
          key={userId}
          show={showChat[userId]}
          onClose={() => toggleChat(userId)}
          className="mb-3"
        >
          <Toast.Header>
            <strong className="me-auto">
              Chat with User {chatRooms[userId].userName}
            </strong>
          </Toast.Header>
          <Toast.Body>
            <div
              style={{ maxHeight: "500px", overflow: "auto" }}
              ref={(el) => (messageContainers.current[userId] = el)}
            >
              {chatRooms[userId].messages.map((msg, index) => (
                <p
                  key={index}
                  className={
                    msg.sender === "admin"
                      ? "bg-primary p-3 ms-4 text-light rounded-pill"
                      : ""
                  }
                >
                  <b>{msg.sender === "admin" ? "You" : "User"} wrote:</b>{" "}
                  {msg.content}
                </p>
              ))}
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={2}
                  id={`messageInput-${userId}`}
                  onKeyUp={(e) => handleKeyPress(e, userId)}
                  placeholder="Type your message here..."
                  style={{ resize: "none" }}
                />
              </Form.Group>
              <Button
                onClick={() =>
                  adminSubmitChatMsg(
                    userId,
                    document.getElementById(`messageInput-${userId}`).value
                  )
                }
                variant="success"
                type="button"
              >
                Send
              </Button>
            </Form>
          </Toast.Body>
        </Toast>
      ))}
    </div>
  );
};

export default AdminChat;
