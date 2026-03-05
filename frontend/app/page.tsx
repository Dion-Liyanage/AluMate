"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  Package,
  Bell,
  BarChart3,
  Wrench,
  Shield,
  HardHat,
  Hammer,
  ArrowRight,
  Award,
  Users,
  Target,
  Clock,
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

// ─── Scroll-spy navbar sections ──────────────────────────────────────────────
const navSections = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// ─── Data ────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: ClipboardList,
    title: "Order Management",
    description:
      "Place and track aluminium fabrication orders with real-time status updates",
  },
  {
    icon: Package,
    title: "Quotation Requests",
    description:
      "Request and receive accurate quotations for custom fabrication work",
  },
  {
    icon: Bell,
    title: "Real-time Updates",
    description:
      "Get instant notifications on order progress and service updates",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Monitor orders, inventory, and business performance at a glance",
  },
  {
    icon: Wrench,
    title: "Service Requests",
    description:
      "Submit and manage maintenance, repair, and installation requests",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Your data is protected with enterprise-grade security and role-based access",
  },
];

const services = [
  {
    icon: HardHat,
    title: "Fabrication & Installation",
    description:
      "Custom aluminium fabrication for windows, doors, curtain walls, and structural systems — tailored to your exact specifications.",
    highlights: [
      "Custom profile cutting",
      "Window & door systems",
      "Curtain wall installation",
    ],
  },
  {
    icon: Wrench,
    title: "Maintenance & Upkeep",
    description:
      "Keep your aluminium installations performing at their best with routine inspections, seal replacements, and preventive care.",
    highlights: [
      "Routine inspections",
      "Seal & gasket work",
      "Performance auditing",
    ],
  },
  {
    icon: Hammer,
    title: "Repair & Restoration",
    description:
      "Expert repair for damaged structures — from glass replacement to corrosion treatment, we restore both function and appearance.",
    highlights: [
      "Damage assessment",
      "Glass replacement",
      "Corrosion treatment",
    ],
  },
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "10+", label: "Years Experience" },
  { value: "200+", label: "Happy Clients" },
  { value: "50+", label: "Team Members" },
];

const values = [
  {
    icon: Award,
    title: "Quality Excellence",
    description: "Premium-grade aluminium with industry-standard finishes",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Solutions designed around your specific project needs",
  },
  {
    icon: Target,
    title: "Precision Engineering",
    description: "State-of-the-art machinery with skilled craftsmanship",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description: "Streamlined workflow ensures on-schedule completion",
  },
];

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "123 Industrial Zone, Colombo, Sri Lanka",
  },
  { icon: Phone, title: "Call Us", detail: "+94 11 234 5678" },
  { icon: Mail, title: "Email Us", detail: "info@alumate.com" },
  { icon: Clock, title: "Hours", detail: "Mon – Fri: 8 AM – 5:30 PM" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Scroll-spy: update active section based on scroll position
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 100;

    for (let i = navSections.length - 1; i >= 0; i--) {
      const section = document.getElementById(navSections[i].id);
      if (section && section.offsetTop <= scrollPosition) {
        setActiveSection(navSections[i].id);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 64; // navbar height
      const top = el.offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative">
        {/* ─── Sticky Scroll-Spy Navbar ─────────────────────────────────── */}
        <nav className="border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <button
                onClick={() => scrollToSection("home")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.3)]" />
                <span className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  AluMate
                </span>
              </button>

              {/* Nav links with scroll-spy */}
              <div className="hidden md:flex items-center gap-1">
                {navSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                      activeSection === section.id
                        ? "text-white bg-zinc-800/70"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Auth buttons */}
              <div className="flex items-center gap-3">
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ─── HOME SECTION ─────────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section id="home">
          {/* Hero */}
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
              {/* Left — Aluminum Bars Image */}
              <motion.div
                initial={{ opacity: 0, x: -80, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative flex items-center justify-center"
              >
                <div className="relative w-full max-w-lg mx-auto">
                  {/* Glow effect behind image */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-zinc-500/20 via-zinc-400/10 to-transparent rounded-2xl blur-2xl" />
                  <Image
                    src="/aluminum-bars.png"
                    alt="Premium aluminum extrusion bars and profiles"
                    width={600}
                    height={500}
                    className="relative z-10 w-full h-auto rounded-xl object-cover drop-shadow-[0_0_40px_rgba(161,161,170,0.2)]"
                    priority
                  />
                </div>
              </motion.div>

              {/* Right — Hero Text */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Streamline Your
                  <br />
                  <span className="bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    Aluminium Fabrication Business
                  </span>
                </h1>
                <p className="mx-auto lg:mx-0 mt-6 max-w-2xl text-lg text-zinc-400">
                  AluMate is a comprehensive platform for managing aluminium
                  fabrication orders, quotations, inventory, and services — all in
                  one place. Simplify your workflow and delight your customers.
                </p>
                <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="text-base bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white border border-zinc-500 shadow-[0_0_30px_rgba(161,161,170,0.3)]"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base cursor-pointer"
                    onClick={() => scrollToSection("services")}
                  >
                    Explore Services
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features grid */}
          <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
                Everything You Need to Run Your Business
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Powerful features designed for aluminium fabrication operations
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-zinc-700 hover:shadow-[0_0_30px_rgba(161,161,170,0.1)]">
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                          <feature.icon className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-zinc-200">
                          {feature.title}
                        </h3>
                        <p className="text-zinc-400">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ─── SERVICES SECTION ─────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section
          id="services"
          className="border-t border-zinc-800/50 bg-zinc-950/60"
        >
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                What We Offer
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Our Services
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
                Comprehensive aluminium solutions — from custom fabrication to
                ongoing maintenance and expert repairs
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-zinc-600 hover:shadow-[0_0_40px_rgba(161,161,170,0.1)] group">
                    <CardContent className="p-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                      <div className="relative z-10">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 group-hover:from-zinc-700 group-hover:to-zinc-800 transition-colors">
                          <service.icon className="h-7 w-7 text-zinc-300" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-zinc-100">
                          {service.title}
                        </h3>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                          {service.description}
                        </p>
                        <ul className="space-y-2">
                          {service.highlights.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2.5 text-sm text-zinc-300"
                            >
                              <CheckCircle2 className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-10 text-center"
            >
              <Link href="/services">
                <Button
                  variant="outline"
                >
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ─── ABOUT SECTION ────────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section id="about" className="border-t border-zinc-800/50">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              {/* Left — story */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                  Who We Are
                </p>
                <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
                  About AluMate
                </h2>
                <div className="space-y-4 text-zinc-400 leading-relaxed">
                  <p>
                    AluMate was built to solve a real problem — aluminium
                    fabrication businesses managing orders through phone calls,
                    scattered paperwork, and disconnected tools.
                  </p>
                  <p>
                    We provide a single platform where businesses manage their
                    entire workflow, and customers can request services, place
                    orders, and track progress at every step — transparently.
                  </p>
                </div>

                <div className="mt-8">
                  <Link href="/about">
                    <Button
                      variant="outline"
                    >
                      Learn More About Us
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Right — stats + values */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.2 + index * 0.08,
                      }}
                      viewport={{ once: true }}
                      className="text-center p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors"
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

                {/* Values */}
                <div className="grid grid-cols-2 gap-4">
                  {values.map((value, index) => (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.08,
                      }}
                      viewport={{ once: true }}
                      className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40"
                    >
                      <value.icon className="h-5 w-5 text-zinc-400 mb-2" />
                      <h4 className="text-sm font-semibold text-zinc-200">
                        {value.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        {value.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ─── CONTACT SECTION ──────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section
          id="contact"
          className="border-t border-zinc-800/50 bg-zinc-950/60"
        >
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Get In Touch
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Contact Us
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
                Have questions or want to discuss a project? Reach out to us —
                we&apos;d love to hear from you
              </p>
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-5">
              {/* Contact info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="lg:col-span-2 space-y-5"
              >
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-zinc-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-400">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-4">
                  <Link href="/contact">
                    <Button
                      variant="outline"
                    >
                      Full Contact Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Quick contact form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                    <div className="relative z-10">
                    {contactSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                          Message Sent!
                        </h3>
                        <p className="text-zinc-400 mb-6">
                          We&apos;ll get back to you within 24 hours.
                        </p>
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setContactSubmitted(false)}
                        >
                          Send Another
                        </Button>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={handleContactSubmit}
                        className="space-y-5"
                      >
                        <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                          Send Us a Message
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="Your Name"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm"
                          />
                          <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Subject"
                          required
                          className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm"
                        />
                        <textarea
                          placeholder="Tell us about your project..."
                          rows={4}
                          required
                          className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm resize-none"
                        />
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white border border-zinc-500"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </Button>
                      </form>
                    )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-800/50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700 shadow-[0_0_50px_rgba(161,161,170,0.15)]">
                <CardContent className="p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent sm:text-4xl relative z-10">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-4 text-lg text-zinc-300 relative z-10 max-w-xl mx-auto">
                    Join businesses already managing their fabrication workflow
                    with AluMate
                  </p>
                  <div className="mt-8 relative z-10">
                    <Link href="/register">
                      <Button
                        size="lg"
                        className="text-base bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-100 hover:to-zinc-200 text-black font-semibold shadow-[0_0_30px_rgba(228,228,231,0.3)]"
                      >
                        Create Your Account
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ─── Footer ───────────────────────────────────────────────────── */}
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
