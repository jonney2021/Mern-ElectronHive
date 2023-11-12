import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import {
  useRegisterMutation,
  // useVerifyOtpMutation,
} from "../slices/usersApiSlice";
// import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  // Add state hooks for OTP
  // const [otp, setOtp] = useState("");
  // const [isOtpSent, setIsOtpSent] = useState(false);

  // Add the verify OTP mutation hook
  // const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  // const verifyOtpHandler = async (e) => {
  //   e.preventDefault();
  //   if (!otp) {
  //     toast.error("Please enter the OTP.");
  //     return;
  //   }
  //   try {
  //     const res = await verifyOtp({ email, otp }).unwrap();
  //     dispatch(setCredentials({ ...res }));
  //     toast.success("Email verified and registration successful!");
  //     navigate(redirect);
  //   } catch (error) {
  //     toast.error(error?.data?.message || error.error || "Verification failed");
  //   }
  // };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    } else {
      try {
        await register({ name, email, password }).unwrap();
        navigate("/verification", { state: { email } }); // Navigate to verification page
        // setIsOtpSent(true); // Set OTP sent state to true
        toast.success(
          "Registration successful! Please check your email for the OTP."
        );

        // dispatch(setCredentials({ ...res }));
        // navigate(redirect);
      } catch (error) {
        toast.error(error?.data?.message || error.error);
      }
    }
  };
  return (
    <FormContainer>
      <h1>Sign Up</h1>
      <Form onSubmit={submitHandler}>
        {/* <Form onSubmit={isOtpSent ? verifyOtpHandler : submitHandler}> */}
        <Form.Group controlId="name" className="my-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="password" className="my-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="confirmPassword" className="my-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        {/* Add OTP input field */}
        {/* {isOtpSent && (
          <Form.Group controlId="otp" className="my-3">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            ></Form.Control>
          </Form.Group>
        )} */}

        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isLoading}
          // disabled={isLoading || isVerifying}
        >
          Register
          {/* {isOtpSent ? "Verify Email" : "Register"} */}
        </Button>
        {isLoading && <Loader />}
        {/* {(isLoading || isVerifying) && <Loader />} */}
      </Form>
      <Row className="py-3">
        <Col>
          Already have an account?{" "}
          <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;
