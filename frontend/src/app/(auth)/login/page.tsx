"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Toast from "@/components/Toast";

export default function SignInOne() {
  const searchParam = useSearchParams();

  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setError] = useState<LoginErrorType>();

  useEffect(() => {
    console.log("The query is", searchParam.get("error"));
  }, []);

  //   * Submit the data
  const submitForm = async () => {
    setLoading(true);
    axios
      .post("/api/auth/login", authData)
      .then((res) => {
        setLoading(false);
        const response = res.data;
        console.log("The response is ", response);
        if (response.status == 200) {
          console.log("The user signed in", response);
          signIn("credentials", {
            email: authData.email,
            password: authData.password,
            callbackUrl: "/dashboard",
            redirect: true,
          });
        } else if (response.status == 400) {
          setError(response?.errors);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("Error is", err);
      });
  };

  // * Google login
  const googleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        <div className="relative flex items-end px-4 pb-10 pt-60 sm:px-6 sm:pb-16 md:justify-center lg:px-8 lg:pb-24">
          <div className="absolute inset-0">
            <img
              className="h-full w-full  object-cover object-top"
              src="https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"
              alt=""
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="relative">
            <div className="w-full max-w-xl xl:mx-auto xl:w-full xl:max-w-xl xl:pr-24">
              <h3 className="text-4xl font-bold text-white">
                Next js Authentication process
              </h3>
              <h2 className="text-white text-xl font-semibold mt-10">
                Production label Authentication with validations
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
              Login
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Don't have an account?
              <Link
                href="/register"
                title=""
                className="font-medium text-black transition-all duration-200 hover:underline ml-2"
              >
                Sign Up
              </Link>
            </p>
            <form action="#" method="POST" className="mt-8">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor=""
                    className="text-base font-medium text-gray-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="email"
                      placeholder="Email"
                      onChange={(e) =>
                        setAuthData({ ...authData, email: e.target.value })
                      }
                    ></input>
                    <span className="text-red-500 font-bold">
                      {errors?.email}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Password
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="password"
                      placeholder="Password"
                      onChange={(e) =>
                        setAuthData({ ...authData, password: e.target.value })
                      }
                    ></input>
                    <span className="text-red-500 font-bold">
                      {errors?.password}
                    </span>
                  </div>
                  <div className="text-right">
                    <Link href="/forgot-password">Forgot password ?</Link>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    className={`inline-flex w-full items-center justify-center rounded-md  px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80  ${
                      loading ? "bg-gray-600" : "bg-black"
                    }`}
                    onClick={submitForm}
                  >
                    {loading ? "Processing.." : "Login"}
                  </button>
                </div>
              </div>
            </form>
            <p className="text-center my-3">-- OR --</p>

            {/* Google Login Button */}
            <div className="space-y-3 mt-3">
              <button
                type="button"
                className="relative inline-flex w-full items-center justify-center rounded-md border border-gray-400 bg-white px-3.5 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black focus:outline-none"
                onClick={googleLogin}
              >
                <span className="mr-2 inline-block"></span>
                <Image
                  src="/google_icon.png"
                  height={30}
                  width={30}
                  alt="Google Icon"
                  className="mr-3"
                />
                Sign in with Google
              </button>
            </div>

            {/* Magic link button */}
            <div className="space-y-3 mt-3">
              <Link
                href="/magic-link"
                className="relative inline-flex w-full items-center justify-center rounded-md border border-gray-400 bg-white px-3.5 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black focus:outline-none"
              >
                Sign in with Magic Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
