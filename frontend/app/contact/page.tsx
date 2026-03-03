"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Industrial Zone", "Colombo, Sri Lanka"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+94 11 234 5678", "+94 77 123 4567"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@alumate.com", "sales@alumate.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon – Fri: 8:00 AM – 5:30 PM", "Sat: 8:00 AM – 1:00 PM"],
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend-only for now — will connect to backend later
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative">
        {/* Navigation */}
        <nav className="border-b border-zinc-800/50 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.3)]" />
                  <span className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    AluMate
                  </span>
                </Link>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/services"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-white border-b-2 border-zinc-400 pb-0.5"
                >
                  Contact
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white border border-zinc-600 shadow-[0_0_20px_rgba(161,161,170,0.2)]">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Get in{" "}
              <span className="bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              Have a question about our services or want to discuss your project?
              We&apos;d love to hear from you.
            </p>
          </motion.div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <h2 className="text-2xl font-bold text-zinc-100 mb-6">
                Contact Information
              </h2>

              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      {item.title}
                    </h3>
                    {item.details.map((detail) => (
                      <p key={detail} className="text-sm text-zinc-400">
                        {detail}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
                <CardContent className="p-8">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-zinc-400 mb-6">
                        Thank you for reaching out. We&apos;ll get back to you
                        within 24 hours.
                      </p>
                      <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50"
                        onClick={() => setSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <h2 className="text-xl font-semibold text-zinc-100 mb-4">
                        Send Us a Message
                      </h2>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-zinc-300 text-sm"
                          >
                            Your Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            required
                            className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-zinc-300 text-sm"
                          >
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="subject"
                          className="text-zinc-300 text-sm"
                        >
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          placeholder="What's this about?"
                          required
                          className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-zinc-300 text-sm"
                        >
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your project or inquiry..."
                          rows={5}
                          required
                          className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500/20 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white border border-zinc-500"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-zinc-500">
              <p>&copy; 2026 AluMate. All rights reserved.</p>
              <p className="mt-2">
                Aluminium Fabrication & Service Management System
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
