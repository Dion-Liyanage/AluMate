"use client";

import { useState } from "react";
import { OrderSelector } from "./OrderSelector";
import { OrderPreviewCard, OrderDetails } from "./OrderPreviewCard";
import { ProductImageCard } from "./ProductImageCard";
import { IssueInput } from "./IssueInput";
import { ImageUpload } from "./ImageUpload";
import { RepairStatusBadge } from "./RepairStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PenTool, Wrench } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Mock data based on the plan
const MOCK_ORDERS: OrderDetails[] = [
  {
    id: "ORD-1001",
    orderNumber: "ORD-1001",
    productType: "Sliding Window",
    designType: "Custom Dimensions",
    installationDate: "2026-02-10",
    imageUrl: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "ORD-1002",
    orderNumber: "ORD-1002",
    productType: "Casement Door",
    designType: "Standard Premium",
    installationDate: "2025-11-22",
    imageUrl: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=200&auto=format&fit=crop",
  },
];

export function RepairForm() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Draft"); // "Draft" -> "Request Sent"

  const selectedOrder = MOCK_ORDERS.find((o) => o.id === selectedOrderId) || null;

  const isFormValid = selectedOrderId !== "" && issueDescription.trim() !== "" && imageFile !== null;
  const isSubmitted = status !== "Draft";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitted) return;

    // Simulate backend submission logic
    const submissionData = {
      userId: "USER001",
      orderId: selectedOrderId,
      issueDescription,
      imageUrl: imageFile ? "Uploaded mock URL" : "None",
      status: "Request Sent",
      createdAt: new Date().toISOString(),
    };

    console.log("Submitting Repair Request:", submissionData);
    setStatus("Request Sent");
    toast.success("Repair request submitted successfully.");
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-cyan-950/40 border-zinc-800 shadow-xl overflow-hidden relative group">
          
          {/* Shimmer wave */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_linear_infinite] pointer-events-none" />

          {/* Decorative background glow (Cyan) */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] opacity-50" />

          {/* Decorative background icon */}
          <div className="absolute top-8 right-8 opacity-30 pointer-events-none group-hover:opacity-40 transition-opacity">
            <Wrench className="w-48 h-48 text-cyan-300" />
          </div>

          <CardHeader className="relative pb-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="mt-1 h-12 w-12 rounded-xl bg-cyan-500/30 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Wrench className="h-6 w-6 text-cyan-100" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-zinc-100">Repair Service</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Request maintenance or repairs for your previously purchased products.
                  </CardDescription>
                </div>
              </div>
              {status !== "Draft" && <RepairStatusBadge status={status} />}
            </div>
          </CardHeader>
          
          <CardContent className="relative space-y-6 focus-within:z-10">
            {/* Order Selection & Preview */}
            <div className="space-y-6">
              <div className="max-w-md">
                <OrderSelector 
                  orders={MOCK_ORDERS}
                  selectedOrderId={selectedOrderId}
                  onSelect={setSelectedOrderId}
                  disabled={isSubmitted}
                />
              </div>
              
              <AnimatePresence mode="wait">
                {selectedOrder && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="grid gap-6 md:grid-cols-2"
                  >
                    <OrderPreviewCard order={selectedOrder} />
                    <ProductImageCard order={selectedOrder} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Issue Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PenTool className="text-cyan-400 w-5 h-5"/>
                <h3 className="text-lg font-medium text-zinc-200">Incident Report</h3>
              </div>
              <IssueInput 
                value={issueDescription}
                onChange={setIssueDescription}
                disabled={isSubmitted}
              />
            </div>

            <Separator className="bg-zinc-800/50" />

             {/* Image Upload */}
             <div className="space-y-4">
              <ImageUpload 
                onImageChange={setImageFile}
                disabled={isSubmitted}
              />
            </div>

          </CardContent>
          <CardFooter className="relative pt-4 border-t border-zinc-800/50 flex justify-end">
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all font-medium min-w-[150px]" 
              disabled={!isFormValid || isSubmitted}
            >
              {isSubmitted ? "Request Submitted" : "Submit Request"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.form>
  );
}
