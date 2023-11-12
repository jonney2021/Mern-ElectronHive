import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Form, Container, Row, Col, InputGroup } from "react-bootstrap";
import {
  useResendEmailVerificationTokenMutation,
  useVerifyOtpMutation,
} from "../slices/usersApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../slices/authSlice";

const OTP_LENGTH = 6;

const isValidOTP = (otp) => {
  return otp.every((value) => !isNaN(parseInt(value)));
};

export default function EmailVerification() {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendEmailVerificationToken, { isLoading: isResending }] =
    useResendEmailVerificationTokenMutation();

  const otpInputRefs = useRef(
    new Array(OTP_LENGTH).fill(0).map(() => React.createRef())
  );

  const location = useLocation();
  const { email } = location.state || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const focusNextInputField = (index) => {
    if (index < OTP_LENGTH - 1) {
      const nextInputField = otpInputRefs.current[index + 1];
      nextInputField.current.focus();
    }
  };

  const focusPrevInputField = (index) => {
    if (index > 0) {
      const prevInputField = otpInputRefs.current[index - 1];
      prevInputField.current.focus();
    }
  };

  const handleOtpChange = (event, index) => {
    const { value } = event.target;
    const newOtp = [...otp];

    // Update the OTP value only if the input is a number or empty (for backspace)
    if (value === "" || !isNaN(value)) {
      newOtp[index] = value.substring(0, 1);
      setOtp(newOtp);

      // Automatically focus the next field if the user inputs a number
      if (value !== "" && index < OTP_LENGTH - 1) {
        focusNextInputField(index);
      }

      // If the value is empty, also clear the previous field
      if (value === "" && index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        focusPrevInputField(index - 1);
      }
    }
  };

  const handleOTPResend = async () => {
    try {
      await resendEmailVerificationToken(email).unwrap();
      toast.success("Verification token resent successfully.");
    } catch (error) {
      toast.error(
        error.data?.message || "Failed to resend verification token."
      );
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index]) {
      focusPrevInputField(index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidOTP(otp)) {
      toast.error("Invalid OTP!");
      return;
    }
    try {
      // Attempt to verify the OTP
      const verifiedUser = await verifyOtp({
        OTP: otp.join(""),
        email: email,
      }).unwrap();

      // Save the credentials
      dispatch(setCredentials(verifiedUser.user)); // set the credentials in the global state and local storage

      toast.success("Email verified successfully. You are now logged in.");
      navigate("/"); // Redirect to the homepage
    } catch (error) {
      toast.error(error.data?.message || "Failed to verify email.");
    }
  };

  useEffect(() => {
    otpInputRefs.current[0].current.focus();
  }, []);

  return (
    <Container className="d-flex vh-100 align-items-center justify-content-center">
      <Row>
        <Col md={6} className="mx-auto">
          <Form onSubmit={handleSubmit}>
            <h1 className="mb-4 text-center">Verify Your Account</h1>
            <p className="text-center mb-4">Enter the OTP sent to your email</p>
            <InputGroup>
              {otp.map((num, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  maxLength="1"
                  value={num}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={otpInputRefs.current[index]}
                  className="text-center mx-1"
                  style={{ flex: "1 0 13%", fontSize: "2rem" }}
                  //   style={{ width: "60px", fontSize: "2rem" }}
                  disabled={isVerifying || isResending}
                />
              ))}
            </InputGroup>
            <Button
              variant="primary"
              type="submit"
              className="w-100 my-3"
              disabled={isVerifying || isResending}
            >
              {/* Verify Account */}
              {isVerifying ? "Verifying..." : "Verify Account"}
            </Button>
            <Button
              variant="link"
              onClick={handleOTPResend}
              className="w-100"
              disabled={isResending}
            >
              {/* Resend OTP */}
              {isResending ? "Resending..." : "Resend OTP"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
