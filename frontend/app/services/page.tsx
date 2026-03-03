"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  Hammer,
  HardHat,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  Ruler,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    icon: HardHat,
    title: "Aluminium Fabrication & Installation",
    description:
      "Custom aluminium fabrication and professional installation for residential, commercial, and industrial projects. From windows and doors to curtain walls and structural systems.",
    features: [
      "Custom profile fabrication",
      "Window & door systems",
      "Curtain wall installation",
      "Structural aluminium frames",
      "Cladding & facade work",
    ],
  },
  {
    icon: Wrench,
    title: "Maintenance & Upkeep",
    description:
      "Regular maintenance services to keep your aluminium installations performing at their best. Preventive care extends the life of your structures and ensures safety.",
    features: [
      "Routine inspections",
      "Seal & gasket replacement",
      "Hardware adjustments",
      "Surface cleaning & treatment",
      "Performance auditing",
    ],
  },
  {
    icon: Hammer,
    title: "Repair & Restoration",
    description:
      "Expert repair services for damaged aluminium structures. We restore functionality and appearance using quality materials and proven techniques.",
    features: [
      "Damage assessment",
      "Glass replacement",
      "Frame realignment",
      "Corrosion treatment",
      "Weather seal repairs",
    ],
  },
];

const whyChooseUs = [
  {
    icon: ClipboardList,
    title: "End-to-End Tracking",
    description: "Track your order from quotation to completion in real-time",
  },
  {
    icon: Ruler,
    title: "Precision Engineering",
    description: "Custom-cut and fabricated to your exact specifications",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assured",
    description: "Premium aluminium materials with industry-standard finishes",
  },
];

export default function ServicesPage() {
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
                  href="/"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/services"
                  className="text-sm font-medium text-white border-b-2 border-zinc-400 pb-0.5"
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

        {/* Hero section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Our{" "}
              <span className="bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              From custom fabrication to ongoing maintenance, we provide
              comprehensive aluminium solutions for projects of every scale.
            </p>
          </motion.div>
        </section>

        {/* Services grid */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-zinc-600 hover:shadow-[0_0_40px_rgba(161,161,170,0.12)] group">
                  <CardContent className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:from-zinc-700 group-hover:to-zinc-800 transition-colors">
                      <service.icon className="h-7 w-7 text-zinc-300" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-zinc-100">
                      {service.title}
                    </h3>
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-zinc-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register">
                      <Button
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 hover:text-white hover:border-zinc-600 group/btn"
                      >
                        Request This Service
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
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
                Why Choose AluMate?
              </h2>
              <p className="mt-4 text-zinc-400">
                We make aluminium fabrication simple, transparent, and reliable
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-3">
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <item.icon className="h-6 w-6 text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-200">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
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
          >
            <Card className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700 shadow-[0_0_50px_rgba(161,161,170,0.15)]">
              <CardContent className="p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                <h2 className="text-3xl font-bold text-zinc-100 relative z-10">
                  Ready to Start Your Project?
                </h2>
                <p className="mt-4 text-zinc-300 relative z-10 max-w-xl mx-auto">
                  Create an account to request a quotation, place an order, or
                  schedule a service. Our team will get back to you promptly.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4 relative z-10">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="text-base bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-100 hover:to-zinc-200 text-black font-semibold shadow-[0_0_30px_rgba(228,228,231,0.3)]"
                    >
                      Create Account
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
              </CardContent>
            </Card>
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
