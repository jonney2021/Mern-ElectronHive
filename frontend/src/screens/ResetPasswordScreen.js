import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import { useResetPasswordMutation } from "../slices/usersApiSlice";

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetToken } = useParams();
  const [resetPassword] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    // Simple validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Call the resetPassword API endpoint
      const result = await resetPassword({
        resetToken,
        password,
        confirmPassword,
      });

      if (result.data) {
        // Display success message to the user
        setMessage("Password reset successful");
        setError("");
        setIsSuccess(true);
      } else {
        // Handle the case where the mutation did not succeed
        // You can check the result object for more details
        console.error("Reset password mutation failed:", result);
        setMessage("");
        setIsSuccess(false); // Reset isSuccess in case of failure
        if (
          result.error &&
          result.error.data.message ===
            "New password must be different from the old one"
        ) {
          setError("New password must be different from the old one");
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      // Handle any error that occurs during the API call
      setMessage("");
      setError(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <FormContainer>
      <h1>Reset Password</h1>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="password" className="my-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="confirmPassword" className="my-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isSuccess}
        >
          Reset Password
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ResetPasswordScreen;
