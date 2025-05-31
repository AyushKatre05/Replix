"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";

function SignInOne() {
  const searchParam = useSearchParams();

  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setError] = useState<{ email?: string; password?: string }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParam.get("error");
    if (err) {
      setToastMsg(decodeURIComponent(err));
    }
  }, [searchParam]);

  const submitForm = async () => {
    setLoading(true);
    setError({});
    try {
      const res = await axios.post("/api/auth/login", authData);
      const response = res.data;

      if (response.status === 200) {
        await signIn("credentials", {
          email: authData.email,
          password: authData.password,
          callbackUrl: "/dashboard",
          redirect: true,
        });
      } else if (response.status === 400) {
        setError(response.errors || {});
        setToastMsg("Invalid credentials");
      }
    } catch (err) {
      setToastMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard",
      redirect: true,
    });
  };

  return (
    <section className="bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 min-h-screen flex items-center justify-center">
      {toastMsg && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-purple-700 text-white rounded-md shadow-lg z-50">
          {toastMsg}
        </div>
      )}
      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Sign In</h1>
        <p className="text-purple-200 mb-6 text-center">Access your account below</p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-purple-100 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full h-12 px-4 rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-500 bg-purple-100 text-purple-900"
              onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
            />
            {errors.email && <p className="text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-purple-100 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full h-12 px-4 rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-500 bg-purple-100 text-purple-900"
              onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
            />
            {errors.password && <p className="text-red-400 mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-between items-center mb-6">
            <Link href="/forgot-password" className="text-purple-300 hover:underline text-sm">
              Forgot password?
            </Link>
            <Link href="/register" className="text-purple-300 hover:underline text-sm">
              Don't have an account? Sign Up
            </Link>
          </div>

          <button
            type="button"
            className={`w-full py-3 rounded-md text-white font-semibold ${
              loading ? "bg-purple-600" : "bg-purple-700 hover:bg-purple-800"
            } transition duration-300`}
            onClick={submitForm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <div className="my-4 text-center text-purple-200">OR</div>

        <button
          type="button"
          className="w-full py-3 rounded-md border border-purple-300 bg-white/10 text-white font-semibold flex items-center justify-center hover:bg-purple-700 transition duration-300"
          onClick={googleLogin}
        >
          <Image
            src="/google_icon.png"
            height={24}
            width={24}
            alt="Google Icon"
            className="mr-3"
          />
          Sign in with Google
        </button>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <SignInOne />
    </Suspense>
  );
}
