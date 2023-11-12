import React from "react";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserChat from "./components/UserChat";

const App = () => {
  const location = useLocation(); // Get the current location
  const isAdminRoute = location.pathname.includes("/admin"); // Check if it's an admin route
  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          <Outlet />
        </Container>
      </main>
      {!isAdminRoute && <UserChat />} {/* Conditionally render UserChat */}
      <Footer />
      <ToastContainer />
    </>
  );
};

export default App;
