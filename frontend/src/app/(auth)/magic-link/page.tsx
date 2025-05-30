"use client";
import React, { useState } from "react";
import axios from "axios";

export default function MagicLink() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 4000);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors({ email: "" });

    axios
      .post("/api/auth/magic-link", { email })
      .then((res) => {
        setLoading(false);
        const response = res.data;

        if (response.status === 400) {
          setErrors(response.errors);
        } else {
          showToast("Check your email for the magic link!", "success");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("The error is", err);
        showToast("Something went wrong. Please try again.", "error");
      });
  };

  return (
    <>
      {/* Custom Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg text-white z-50 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="h-screen w-screen flex justify-center items-center bg-gray-100">
        <div className="w-[500px] bg-white rounded-lg shadow-md p-5">
          <h1 className="font-bold text-2xl mb-4">Magic Link</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                className="h-10 rounded-lg border border-gray-300 w-full p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-2 transition"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
