"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Users,
  Target,
  Clock,
  ShieldCheck,
  Leaf,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Quality Excellence",
    description:
      "We use premium-grade aluminium and industry-standard finishing processes to deliver products that meet the highest quality benchmarks.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Every project begins with understanding your needs. We work closely with clients to deliver solutions that exceed expectations.",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description:
      "We value your time. Our streamlined workflow and real-time tracking ensure your projects are delivered on schedule.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Compliance",
    description:
      "All our work adheres to industry safety standards and building regulations, ensuring safe and compliant installations.",
  },
  {
    icon: Target,
    title: "Precision Fabrication",
    description:
      "State-of-the-art machinery and skilled craftsmen ensure every cut, joint, and finish is executed with precision.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description:
      "Aluminium is 100% recyclable. We minimize waste and prioritize eco-friendly processes throughout our operations.",
  },
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "10+", label: "Years Experience" },
  { value: "200+", label: "Happy Clients" },
  { value: "50+", label: "Team Members" },
];

export default function AboutPage() {
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
                  className="text-sm font-medium text-white border-b-2 border-zinc-400 pb-0.5"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
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
              About{" "}
              <span className="bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                AluMate
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-400 leading-relaxed">
              AluMate is a modern platform built to connect aluminium fabrication
              businesses with their customers. We simplify the entire process —
              from requesting a quotation to tracking your order in real-time.
            </p>
          </motion.div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-zinc-100 mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>
                  Many aluminium fabrication businesses still rely on manual
                  processes, phone calls, and scattered paperwork to manage
                  orders, quotations, and service requests. This leads to
                  miscommunication, delayed deliveries, and frustrated customers.
                </p>
                <p>
                  AluMate was built to change that. We provide a single,
                  centralized platform where businesses can manage their entire
                  workflow — and where customers can easily request services,
                  place orders, and track progress at every step.
                </p>
                <p>
                  Our goal is to make aluminium fabrication operations more
                  efficient, transparent, and customer-friendly.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        className="text-center p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
                      >
                        <p className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {stat.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-zinc-800/50 bg-zinc-950/50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                What We Stand For
              </h2>
              <p className="mt-4 text-zinc-400">
                Our core values guide everything we do
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                        <value.icon className="h-5 w-5 text-zinc-300" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-zinc-200">
                        {value.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-zinc-100">
              Ready to Work With Us?
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Whether you need custom fabrication, maintenance, or repairs — we
              are here to help. Get in touch or create an account to get started.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="text-base bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-100 hover:to-zinc-200 text-black font-semibold shadow-[0_0_30px_rgba(228,228,231,0.3)]"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base border-zinc-600 text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
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
