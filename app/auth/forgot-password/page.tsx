"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Password Reset
  
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      // Note: For security, Supabase may return success even if the email isn't registered.
      // Show a generic message to avoid email enumeration.
      setMessage("If an account exists for this email, a reset link has been sent.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Forgot Password</h1>
        <p className="mb-6 text-gray-500">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <Label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Student Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#3AAFA9] focus:border-[#2B7A78] transition"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}

          <Button
            type="submit"
            className="w-full rounded-lg bg-black hover:bg-gray-900 text-white font-semibold py-2 text-base shadow-md transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="font-medium text-[#2B7A78] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
