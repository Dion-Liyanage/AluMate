"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Loader2,
  Shield,
  CheckCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { profileApi } from "@/lib/api";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watchPassword("newPassword");

  // Populate form with user data when user changes or loads
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const response = await profileApi.update({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
      });

      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        toast.success("Profile details updated successfully!");
      } else {
        toast.error(response.message || "Failed to update profile.");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile.";
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const response = await profileApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        toast.success("Password changed successfully!");
        resetPassword();
      } else {
        toast.error(response.message || "Failed to change password.");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to change password.";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-400">Loading profile details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";

  return (
    <DashboardLayout title="My Profile">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.015)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_linear_infinite]" />
            <CardContent className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-gradient-to-tr from-zinc-800 via-zinc-900 to-zinc-950 shadow-[0_0_20px_rgba(161,161,170,0.1)]">
                <span className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  {initials}
                </span>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h2 className="text-2xl font-bold text-zinc-100">
                    {user ? `${user.firstName} ${user.lastName}` : "User Profile"}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 shadow-sm capitalize">
                    <Shield className="h-3 w-3 text-zinc-500" />
                    {user?.role || "Customer"}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 flex items-center justify-center gap-1.5 sm:justify-start">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-sm text-zinc-400 flex items-center justify-center gap-1.5 sm:justify-start">
                    <Phone className="h-4 w-4 text-zinc-500" />
                    {user.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details and Password Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 p-1 border border-zinc-800 rounded-xl mb-6">
              <TabsTrigger
                value="personal"
                className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                <User className="mr-2 h-4 w-4" />
                Personal Details
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                <Lock className="mr-2 h-4 w-4" />
                Security & Password
              </TabsTrigger>
            </TabsList>

            {/* TAB: Personal Details */}
            <TabsContent value="personal">
              <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950/80">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Update all the personal details and contact info you provided when registering.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleProfileSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    {/* Name Inputs */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-zinc-300">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                          {...registerProfile("firstName", {
                            required: "First name is required",
                            minLength: {
                              value: 2,
                              message: "Must be at least 2 characters",
                            },
                          })}
                        />
                        {profileErrors.firstName && (
                          <p className="text-xs text-red-400">
                            {profileErrors.firstName.message}
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
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                          {...registerProfile("lastName", {
                            required: "Last name is required",
                            minLength: {
                              value: 2,
                              message: "Must be at least 2 characters",
                            },
                          })}
                        />
                        {profileErrors.lastName && (
                          <p className="text-xs text-red-400">
                            {profileErrors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                          {...registerProfile("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                        {profileErrors.email && (
                          <p className="text-xs text-red-400">
                            {profileErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-zinc-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                          {...registerProfile("phone")}
                        />
                      </div>
                    </div>

                    {/* Address Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-zinc-300 flex items-center gap-1.5"
                      >
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        Delivery / Site Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Provide your physical fabrication delivery or installation address..."
                        className="min-h-[100px] bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                        {...registerProfile("address")}
                      />
                    </div>

                    {/* Save Buttons */}
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-100 border border-zinc-600 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all cursor-pointer"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving details...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Security & Password */}
            <TabsContent value="security">
              <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950/80">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100">
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Update your account password securely by confirming your current password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-zinc-300">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-red-400">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New and Confirm Password */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-zinc-300">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                          {...registerPassword("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 6,
                              message: "New password must be at least 6 characters",
                            },
                          })}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-xs text-red-400">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-zinc-300">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700/20"
                          {...registerPassword("confirmPassword", {
                            required: "Please confirm your new password",
                            validate: (val) =>
                              val === newPassword || "New passwords do not match",
                          })}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-xs text-red-400">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Save Buttons */}
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-100 border border-zinc-600 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all cursor-pointer"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating password...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
