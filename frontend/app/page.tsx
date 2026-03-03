"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Package, Bell, BarChart3, Wrench, Shield } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: ClipboardList,
      title: "Order Management",
      description: "Place and track aluminium fabrication orders with real-time status updates",
    },
    {
      icon: Package,
      title: "Quotation Requests",
      description: "Request and receive accurate quotations for custom fabrication work",
    },
    {
      icon: Bell,
      title: "Real-time Updates",
      description: "Get instant notifications on order progress and service updates",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Monitor orders, inventory, and business performance at a glance",
    },
    {
      icon: Wrench,
      title: "Service Requests",
      description: "Submit and manage maintenance, repair, and installation requests",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and role-based access",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Grid overlay for industrial effect */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative">
        {/* Navigation */}
        <nav className="border-b border-zinc-800/50 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.3)]" />
                <span className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">AluMate</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/50">Login</Button>
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

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Streamline Your
              <br />
              <span className="bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Aluminium Fabrication Business
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              AluMate is a comprehensive platform for managing aluminium fabrication orders, quotations,
              inventory, and services — all in one place. Simplify your workflow and delight your customers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-base bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white border border-zinc-500 shadow-[0_0_30px_rgba(161,161,170,0.3)]">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Powerful features designed to streamline aluminium fabrication operations
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-zinc-700 hover:shadow-[0_0_30px_rgba(161,161,170,0.15)]">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <feature.icon className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-zinc-200">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700 shadow-[0_0_50px_rgba(161,161,170,0.2)]">
              <CardContent className="p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent sm:text-4xl relative z-10">
                  Ready to Get Started?
                </h2>
                <p className="mt-4 text-lg text-zinc-300 relative z-10">
                  Join businesses already managing their fabrication workflow with AluMate
                </p>
                <div className="mt-8 relative z-10">
                  <Link href="/register">
                    <Button size="lg" className="text-base bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-100 hover:to-zinc-200 text-black font-semibold shadow-[0_0_30px_rgba(228,228,231,0.3)]">
                      Create Your Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-zinc-500">
              <p>&copy; 2026 AluMate. All rights reserved.</p>
              <p className="mt-2">Aluminium Fabrication & Service Management System</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
