import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserChat from "./components/UserChat";
import { useSelector } from "react-redux";
// import useWebSocket from "./useWebSocket";
// import { useSelector } from "react-redux";

const App = () => {
  const location = useLocation(); // Get the current location
  const isAdminRoute = location.pathname.includes("/admin"); // Check if it's an admin route
  const userInfo = useSelector((state) => state.auth.userInfo);

  // const userInfo = useSelector((state) => state.auth.userInfo);

  // const dispatch = useDispatch();
  // const { userInfo } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   if (userInfo?.isAdmin) {
  //     const socket = socketIOClient();

  //     socket.on("new user message", (data) => {
  //       dispatch(
  //         addMessage({
  //           userId: data.userId,
  //           userName: data.userName,
  //           message: {
  //             sender: "user",
  //             content: data.message,
  //             createdAt: new Date().toISOString(),
  //           },
  //         })
  //       );
  //       // Dispatch action to set message as unread
  //       dispatch(setMessageReceived({ userId: data.userId }));
  //     });

  //     return () => socket.disconnect();
  //   }
  // }, [userInfo, dispatch]);

  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          <Outlet />
        </Container>
      </main>
      {!isAdminRoute && userInfo && <UserChat />}{" "}
      {/* Conditionally render UserChat */}
      <Footer />
      <ToastContainer />
    </>
  );
};

export default App;
