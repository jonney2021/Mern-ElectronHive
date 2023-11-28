import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useForgotPasswordMutation } from "../slices/usersApiSlice";
// import { useLocation } from "react-router-dom";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  //   const location = useLocation();

  //   useEffect(() => {
  //     // Set the email in the state only if it's present in the state object
  //     if (location.state && location.state.email) {
  //       setEmail(location.state.email);
  //     }
  //   }, [location.state]);

  const [forgotPassword] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    // Check if the form is already submitting
    if (isSubmitting) {
      setError("Reset link already sent. Please check your email.");
      return;
    }

    // Disable the button to prevent multiple submissions
    setIsSubmitting(true);

    try {
      // Call the forgotPassword API endpoint
      const { data, error: apiError } = await forgotPassword({ email });

      if (data) {
        // Check the specific data you're interested in from the API response
        setMessage(
          data.message || "Password reset email sent, please check your email."
        );
        setError("");
      } else {
        console.error("Forgot password mutation failed:", apiError);
        setError(
          apiError?.error?.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      console.error("API Error:", error);
      // Handle any error that occurs during the API call
      setMessage("");
      setError(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <FormContainer>
      <h1>Forgot Password</h1>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
