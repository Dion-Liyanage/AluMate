"use client";

import { useState } from "react";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { CustomerDetailsForm } from "./CustomerDetailsForm";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { MapPin } from "lucide-react";

import { motion } from "framer-motion";

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

export function OnSiteVisitForm() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    nearestTown: "",
  });
  const [status, setStatus] = useState("Draft"); // Draft -> Request Sent

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = 
    selectedDate !== "" && 
    selectedSlot !== "" && 
    formData.fullName.trim() !== "" && 
    formData.contactNumber.trim() !== "" && 
    formData.nearestTown.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Simulate form submission
    const submissionData = {
      userId: "dummy-user-id", // Later replaced with actual user logic
      date: selectedDate,
      timeSlot: selectedSlot,
      ...formData,
      status: "Request Sent",
      createdAt: new Date().toISOString()
    };
    
    console.log("Submitting Request:", submissionData);
    setStatus("Request Sent");
    toast.success("Visit request submitted successfully");
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
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
          
          <CardHeader className="relative pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-zinc-100">Schedule Measurement</CardTitle>
                <CardDescription className="text-zinc-400 mt-1">
                  Book our experts to visit your location for precise measurements and consultation.
                </CardDescription>
              </div>
              {status !== "Draft" && <RequestStatusBadge status={status} />}
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {/* Scheduling Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <DateSelector value={selectedDate} onChange={(val) => {
                setSelectedDate(val);
                setSelectedSlot(""); // Reset slot when date changes
              }} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Available Time Slots
                </label>
                <TimeSlotSelector 
                  selectedDate={selectedDate} 
                  selectedSlot={selectedSlot} 
                  onSelect={setSelectedSlot} 
                />
              </div>
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-200">Contact Details</h3>
              <CustomerDetailsForm formData={formData} onChange={handleFormChange} />
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Location Placeholder */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-200">Location</h3>
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-zinc-800/80 rounded-full p-4 shadow-sm border border-zinc-700/50">
                  <MapPin className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-zinc-300">Location Selection</p>
                  <p className="text-sm text-zinc-500 mt-1">Interactive map will be available in Section 2.</p>
                </div>
                <Button disabled variant="outline" className="mt-3 border-zinc-700 bg-zinc-800/50 text-zinc-500" type="button">
                  Select Location on Map
                </Button>
              </div>
            </div>
            
          </CardContent>
          <CardFooter className="relative pt-4 border-t border-zinc-800/50">
            <Button 
              type="submit" 
              className="w-full sm:w-auto ml-auto bg-emerald-600 hover:bg-emerald-700 text-white border-0" 
              disabled={!isFormValid || status === "Request Sent" || status === "Approved"}
            >
              {status === "Draft" ? "Submit Request" : "Request Already Submitted"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.form>
  );
}
