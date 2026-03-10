"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed. Please try again.";
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
            Create Account
          </h1>
          <p className="text-sm text-zinc-400 text-center">
            Get started with AluMate today
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "At least 2 characters",
                    },
                  })}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "At least 2 characters",
                    },
                  })}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">
                Phone{" "}
                <span className="text-zinc-500 text-xs">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                {...register("phone")}
              />
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
              <p className="text-xs text-zinc-500 mt-1">
                Password must be at least 6 characters long.
              </p>
              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20 pr-10"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-zinc-200 hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
