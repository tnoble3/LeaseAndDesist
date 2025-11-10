import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

const Signup = () => {
  const { register: authRegister, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth(); // your login function from context

  const onSubmit = async (data) => {
    try {
      // Call backend register endpoint
      const response = await axios.post("/api/users/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const { token, user } = response.data;

      // Log in the user in your app context
      login(token, user);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Name</label>
          <input
            {...authRegister("name", { required: "Name is required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label>Email</label>
          <input
            {...authRegister("email", { required: "Email is required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            {...authRegister("password", { required: "Password is required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
