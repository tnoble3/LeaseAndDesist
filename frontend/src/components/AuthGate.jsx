import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerUser, loginUser } from "../api/goalService.js";

const AuthGate = ({ onAuthenticated }) => {
  const [mode, setMode] = useState("login");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const switchMode = (next) => {
    setMode(next);
    setServerMessage("");
    reset({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const onSubmit = async (values) => {
    setServerMessage("");
    try {
      if (mode === "register") {
        await registerUser(values);
        setServerMessage("Account created! Please log in.");
        switchMode("login");
        reset({ username: values.username, password: "", confirmPassword: "" });
        return;
      }

      const response = await loginUser({
        username: values.username,
        password: values.password,
      });

      if (response?.token) {
        window.localStorage.setItem("demo_jwt", response.token);
        window.localStorage.setItem("demo_user", JSON.stringify(response.user));
        onAuthenticated?.(response.token, response.user);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        `Unable to ${mode === "login" ? "log in" : "register"} right now.`;
      setServerMessage(message);
    }
  };

  return (
    <div className="auth-panel card">
      <header>
        <p className="eyebrow">{mode === "login" ? "Welcome back" : "Join us"}</p>
        <h2 className="auth-title">{mode === "login" ? "Login" : "Create account"}</h2>
        <p className="muted">Hello, please login or sign up to continue.</p>
      </header>

      <div className="auth-toggle">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => switchMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => switchMode("register")}
        >
          Sign Up
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        {mode === "register" && (
          <>
            <label>
              First Name<span className="required">*</span>
              <input
                type="text"
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && (
                <span className="error">{errors.firstName.message}</span>
              )}
            </label>
            <label>
              Last Name<span className="required">*</span>
              <input
                type="text"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <span className="error">{errors.lastName.message}</span>
              )}
            </label>
            <label>
              Email Address
              <input type="email" {...register("email")} />
            </label>
          </>
        )}

        <label>
          Username<span className="required">*</span>
          <input
            type="text"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <span className="error">{errors.username.message}</span>
          )}
        </label>

        <label>
          Password<span className="required">*</span>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}
        </label>

        {mode === "register" && (
          <label>
            Confirm Password<span className="required">*</span>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords must match",
              })}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword.message}</span>
            )}
          </label>
        )}

        {serverMessage && <div className="info-banner">{serverMessage}</div>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "One moment..." : mode === "login" ? "Login" : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default AuthGate;
