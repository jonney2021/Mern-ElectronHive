import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavbarBrand,
  Badge,
  NavDropdown,
} from "react-bootstrap";
import SearchBox from "./SearchBox";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import logo from "../assets/logo.png";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import socketIOClient from "socket.io-client";
import { useEffect } from "react";
import { setMessageReceived } from "../slices/unreadMessagesSlice";
import "../../src/chats.css";

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const unreadMessages = useSelector((state) => state.unreadMessages);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo?.isAdmin) {
      var audio = new Audio("/audio/chat-msg.mp3");
      const socket = socketIOClient();
      // socket.emit(
      //   "admin connected with server",
      //   "Admin" + Math.floor(Math.random() * 1000000000000)
      // );
      // socket.on("server sends message from client to admin", (data) => {
      socket.on("new user message", (data) => {
        console.log("New message received for admin:", data);
        if (data && data.userId) {
          dispatch(setMessageReceived({ userId: data.userId }));
          audio.play();
        }
      });
      return () => socket.disconnect();
    }
  }, [userInfo?.isAdmin, dispatch]);

  const hasUnreadMessages = Object.values(unreadMessages).some(
    (status) => status
  );
  console.log("hasUnreadMessages", hasUnreadMessages);
  console.log("userInfo", userInfo);

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img src={logo} alt="BestShop" />
              BestShop
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <SearchBox />
              <LinkContainer to="/cart">
                <Nav.Link>
                  <FaShoppingCart />
                  Cart{" "}
                  {cartItems.length > 0 && (
                    <Badge pill bg="success" style={{ marginLeft: "5px" }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link href="/login">
                    <FaUser />
                    Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown
                  title={
                    <span className="admin-title">
                      Admin
                      {userInfo && userInfo.isAdmin && hasUnreadMessages && (
                        <span className="position-absolute top-0 start-10 translate-middle p-2 bg-danger border border-light rounded-circle"></span>
                      )}
                    </span>
                  }
                  id="adminmenu"
                  className="admin-dropdown"
                >
                  {/* {hasUnreadMessages && (
                    <span className="red-indicator p-2 bg-danger border border-light rounded-circle"></span>
                  )} */}
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/analytics">
                    <NavDropdown.Item>Analytics</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/chats">
                    <NavDropdown.Item>Chats</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
