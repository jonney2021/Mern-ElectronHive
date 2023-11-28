import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // const handleForgotPassword = () => {
  //   // Debug logging to check the value of email before constructing the link
  //   console.log("Email before constructing forgot password link:", email);

  //   // Redirect to the forgot password page with the user's email as a query parameter
  //   navigate(`/forgot-password`, { state: { email } });
  // };
  return (
    <FormContainer>
      <h1>Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="password" className="my-3 position-relative">
          <Form.Label>Password</Form.Label>
          <Form.Control
            // type="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>

          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            // className="position-absolute end-0 top-0 mt-2 me-2"
            className="toggle-password-button"
            style={{
              position: "absolute",
              top: "70%", // Center vertically
              // right: "10px", // Space from the right edge
              right: "0.75rem",
              transform: "translateY(-50%)", // Center vertically
              border: "none", // Optional: removes the border
              background: "none", // Optional: makes the button background transparent
              padding: "0", // Removes padding to fit the button neatly
            }}
            // style={{ zIndex: 10 }}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
          </Button>
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isLoading}
        >
          Sign In
        </Button>
        {isLoading && <Loader />}
      </Form>
      <Row className="py-3">
        <Col>
          New Customer?{" "}
          <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}>
            Register
          </Link>
        </Col>
        <Col className="text-end">
          <Link to="/forgot-password">Forgot Password?</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
