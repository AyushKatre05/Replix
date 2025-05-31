"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function MagicLinkLogin() {
  const searchParam = useSearchParams();
  const email = searchParam.get("email");
  const signature = searchParam.get("signature");

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

  useEffect(() => {
    if (!email || !signature) {
      showToast("Invalid or missing link parameters.", "error");
      return;
    }

    axios
      .post("/api/auth/magic-link/verify", {
        email,
        token: signature,
      })
      .then((res) => {
        const response = res.data;
        if (response.status === 200) {
          showToast("Redirecting you to the home page.", "success");
          setTimeout(() => {
            signIn("credentials", {
              email: response.email,
              password: "",
              callbackUrl: "/dashboard",
              redirect: true,
            });
          }, 1500);
        } else {
          showToast(response.message || "Invalid link", "error");
        }
      })
      .catch((err) => {
        console.log("The error is", err);
        showToast("Something went wrong. Please try again.", "error");
      });
  }, [email, signature]);

  return (
    <>
      {toast.show && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="h-screen w-screen flex justify-center items-center">
        <h1 className="text-lg font-medium">Please wait, validating your link...</h1>
      </div>
    </>
  );
}
