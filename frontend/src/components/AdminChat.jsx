import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { addMessage, clearPendingMessages } from "../slices/chatSlice";
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
  const pendingMessages = useSelector((state) => state.chat.pendingMessages);
  const userId = useSelector((state) => state.auth.userInfo._id);
  const [showChat, setShowChat] = useState({});
  const messageContainers = useRef({});

  useEffect(() => {
    const socket = socketIOClient();

    socket.emit("admin online");

    socket.emit("admin reconnects", { adminId: userId }); // Emitting the admin reconnect event
    // socket.on("server sends message from client to admin", (data) => {
    socket.on("new user message", (data) => {
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

    // // Listen for an event to receive pending messages
    // socket.on("receive pending messages", (receivedPendingMessages) => {
    //   Object.keys(receivedPendingMessages).forEach((chatUserId) => {
    //     receivedPendingMessages[chatUserId].forEach((msg) => {
    //       dispatch(addMessage({ userId: chatUserId, message: msg }));
    //     });
    //     dispatch(clearPendingMessages(chatUserId));
    //   });
    // });

    setSocket(socket);
    // Cleanup function
    return () => {
      socket.off("new user message");
      // socket.off("receive pending messages");
      socket.disconnect();
    };
  }, [dispatch, userId]);

  useEffect(() => {
    // Process and clear pending messages for each chat room
    Object.keys(pendingMessages).forEach((chatUserId) => {
      pendingMessages[chatUserId].forEach((msg) => {
        dispatch(addMessage({ userId: chatUserId, ...msg }));
      });
      dispatch(clearPendingMessages(chatUserId));
    });
  }, [dispatch, pendingMessages]);

  const adminSubmitChatMsg = (userId, messageText) => {
    if (!messageText || !userId) {
      return;
    }

    const message = {
      userId,
      userName: "Admin", // userName isn't necessary for admin messages
      message: messageText,
      sender: "admin",
    };

    socket.emit("admin sends message", message);

    dispatch(
      addMessage({
        userId,
        userName: "Admin",
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

  useEffect(() => {
    // Scroll to bottom whenever messages change
    Object.keys(chatRooms).forEach((userId) => {
      scrollToBottom(userId);
    });
  }, [chatRooms]); // Re-run this effect when chatRooms changes

  return (
    <div className="admin-chat-container">
      <div className="chat-rooms-container">
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
    </div>
  );
};

export default AdminChat;
