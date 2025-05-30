"use client";
import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPassword({
  params,
}: {
  params: { email: string };
}) {
  const searchParam = useSearchParams();
  const [authState, setAuthState] = useState({
    password: "",
    cpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    axios
      .post("/api/auth/reset-password", {
        email: params.email,
        signature: searchParam.get("signature"),
        password: authState.password,
        password_confirmation: authState.cpassword,
      })
      .then((res) => {
        setLoading(false);
        const response = res.data;
        if (response.status === 400) {
          showToast(response.message, "error");
        } else if (response.status === 200) {
          showToast(response.message, "success");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("err..", err);
        showToast("Server error. Please try again.", "error");
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

      {/* Reset Password Form */}
      <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
        <div className="w-[500px] p-5 rounded-lg shadow-lg bg-white">
          <h1 className="text-2xl text-purple-500 font-bold">Reset Password</h1>

          <form onSubmit={submit}>
            <div className="mt-5">
              <label className="block">Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                className="w-full h-10 p-2 border rounded-md outline-red-400"
                onChange={(event) =>
                  setAuthState({ ...authState, password: event.target.value })
                }
                value={authState.password}
              />
            </div>
            <div className="mt-5">
              <label className="block">Confirm Password</label>
              <input
                type="password"
                placeholder="Enter your confirm password"
                className="w-full h-10 p-2 border rounded-md outline-red-400"
                onChange={(event) =>
                  setAuthState({ ...authState, cpassword: event.target.value })
                }
                value={authState.cpassword}
              />
            </div>
            <div className="mt-5">
              <button
                className="w-full bg-purple-500 p-2 rounded-lg text-white"
                disabled={loading}
              >
                {loading ? "Processing.." : "Submit"}
              </button>
            </div>
            <div className="mt-5 text-center">
              <Link href="/login" className="text-orange-400">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
