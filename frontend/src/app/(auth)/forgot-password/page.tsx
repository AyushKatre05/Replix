"use client";
import React, { useState } from "react";
import axios from "axios";

type LoginErrorType = {
  email?: string;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrorType>();
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    axios
      .post("/api/auth/forgot-password", { email })
      .then((res) => {
        setLoading(false);
        const response = res.data;
        if (response.status === 200) {
          showToast(response.message, "success");
        } else if (response.status === 400) {
          setErrors(response.errors);
          showToast(response.errors?.email || "Invalid input", "error");
        } else if (response.status === 500) {
          showToast(response.message || "Something went wrong", "error");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("The error is", err);
        showToast("Server error. Please try again later.", "error");
      });
  };

  return (
    <>
      {/* Custom Toast */}
      {toast.show && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main UI */}
      <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
        <div className="w-[500px] p-6 rounded-lg shadow-lg bg-white">
          <h1 className="text-2xl font-bold text-purple-500 mb-2">Forgot Password?</h1>
          <p className="text-gray-600 mb-4">
            Don&apos;t worry it happens. Just enter your email below and we&apos;ll send you a reset link.
          </p>
          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                placeholder="ayush@gmail.com"
                className="w-full h-10 p-2 border rounded-md outline-purple-500 focus:ring-2 focus:ring-purple-400"
                onChange={(event) => setEmail(event.target.value)}
                value={email}
              />
              {errors?.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
