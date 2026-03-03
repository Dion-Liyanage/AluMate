"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirect") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Login successful!");

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const storedUser = localStorage.getItem("alumate_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          router.push(user.role === "admin" ? "/admin" : "/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-[0_0_50px_rgba(161,161,170,0.1)]">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.3)]" />
          </div>
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-400 text-center">
            Sign in to your AluMate account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20 pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-500/20"
                  {...register("rememberMe")}
                />
                <span className="text-sm text-zinc-400">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white border border-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.2)] transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-zinc-200 hover:text-white font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoginSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
      <CardHeader className="space-y-3 pb-4">
        <Skeleton className="h-10 w-10 rounded-lg mx-auto bg-zinc-800" />
        <Skeleton className="h-6 w-32 mx-auto bg-zinc-800" />
        <Skeleton className="h-4 w-48 mx-auto bg-zinc-800" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
