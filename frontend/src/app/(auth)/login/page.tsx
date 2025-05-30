"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import Image from "next/image";

export default function SignInOne() {
  const searchParam = useSearchParams();

  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setError] = useState<{ email?: string; password?: string }>();

  useEffect(() => {
    console.log("The query is", searchParam.get("error"));
  }, []);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", authData);
      const response = res.data;
      setLoading(false);

      if (response.status === 200) {
        await signIn("credentials", {
          email: authData.email,
          password: authData.password,
          callbackUrl: "/dashboard",
          redirect: true,
        });
      } else if (response.status === 400) {
        setError(response.errors);
      }
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);
    }
  };

  const googleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Replix</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your account to continue</p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={submitForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  required
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm font-semibold">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={authData.password}
                    onChange={(e) =>
                      setAuthData({ ...authData, password: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors?.password && (
                  <p className="text-red-500 text-sm font-semibold">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-purple-300 hover:text-purple-200">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 bg-white/5"
              onClick={googleLogin}
            >
              <Image src="/google_icon.png" width={20} height={20} alt="Google" className="mr-2" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 bg-white/5"
              asChild
            >
              <Link href="/magic-link">
                <Mail className="w-4 h-4 mr-2" />
                Sign in with Magic Link
              </Link>
            </Button>

            <div className="text-center">
              <p className="text-gray-300">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-purple-300 hover:text-purple-200 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
