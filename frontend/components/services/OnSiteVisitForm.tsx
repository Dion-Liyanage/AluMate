"use client";

import { useState } from "react";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { CustomerDetailsForm } from "./CustomerDetailsForm";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { MapPin, Ruler } from "lucide-react";
import { LocationPickerModal } from "@/components/location/LocationPickerModal";
import { LocationPreview } from "@/components/location/LocationPreview";

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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [locationInputMode, setLocationInputMode] = useState<"map" | "manual">("map");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [status, setStatus] = useState("Draft"); // Draft -> Request Sent

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = 
    selectedDate !== "" && 
    selectedSlot !== "" && 
    formData.fullName.trim() !== "" && 
    formData.contactNumber.trim() !== "" && 
    formData.nearestTown.trim() !== "" &&
    (location !== null || manualAddress.trim() !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Simulate form submission
    const submissionData = {
      userId: "dummy-user-id", // Later replaced with actual user logic
      date: selectedDate,
      timeSlot: selectedSlot,
      ...formData,
      manualAddress: manualAddress.trim() || null,
      location: location ? { lat: location.lat, lng: location.lng } : null,
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
        <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-fuchsia-950/40 border-zinc-800 shadow-xl overflow-hidden relative group">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_linear_infinite]" />
          
          {/* Decorative background glow (Fuchsia) */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] opacity-50" />

          {/* Decorative background icon (Fuchsia) */}
          <div className="absolute top-8 right-8 opacity-30 pointer-events-none group-hover:opacity-40 transition-opacity">
            <MapPin className="w-48 h-48 text-fuchsia-300" />
          </div>

          <CardHeader className="relative pb-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="mt-1 h-12 w-12 rounded-xl bg-fuchsia-500/30 flex items-center justify-center border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                  <Ruler className="h-6 w-6 text-fuchsia-100" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-zinc-100">Schedule Measurement</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Book our experts to visit your location for precise measurements and consultation.
                  </CardDescription>
                </div>
              </div>
              {status !== "Draft" && <RequestStatusBadge status={status} />}
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6 focus-within:z-10">
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

            {/* Location Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-200">Location</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={locationInputMode === "map" ? "default" : "outline"}
                  onClick={() => setLocationInputMode("map")}
                  className={locationInputMode === "map" ? "bg-fuchsia-600 hover:bg-fuchsia-700" : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800"}
                >
                  Select Location
                </Button>
                <Button
                  type="button"
                  variant={locationInputMode === "manual" ? "default" : "outline"}
                  onClick={() => setLocationInputMode("manual")}
                  className={locationInputMode === "manual" ? "bg-fuchsia-600 hover:bg-fuchsia-700" : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800"}
                >
                  Enter Address (Optional)
                </Button>
              </div>

              {locationInputMode === "map" ? (
                location ? (
                  <LocationPreview
                    location={location}
                    onChangeLocation={() => setIsMapOpen(true)}
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-fuchsia-500/20 rounded-full p-4 shadow-sm border border-fuchsia-500/30">
                      <MapPin className="h-6 w-6 text-fuchsia-300" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-300">Select Your Location</p>
                      <p className="text-sm text-zinc-500 mt-1">Click below to open the map and pin your location.</p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-3 border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/20 hover:text-fuchsia-100"
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                    >
                      <MapPin className="h-4 w-4 mr-1.5" />
                      Select Location on Map
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Manual Address</label>
                  <Textarea
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter address manually (optional)"
                    className="min-h-24 !bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 [color-scheme:dark] autofill:shadow-[inset_0_0_0px_1000px_rgba(39,39,42,0.8)] autofill:[-webkit-text-fill-color:#f4f4f5]"
                  />
                  <p className="text-xs text-zinc-500">You can provide an address instead of selecting on the map.</p>
                </div>
              )}

              <LocationPickerModal
                open={isMapOpen}
                onOpenChange={setIsMapOpen}
                onConfirm={setLocation}
                initialLocation={location}
              />

              {locationInputMode === "manual" && location && (
                <div className="rounded-md border border-zinc-800/50 bg-zinc-900/30 p-3 text-xs text-zinc-400">
                  Map location is already selected and will be submitted together with the manual address.
                </div>
              )}
              {locationInputMode === "map" && manualAddress.trim() !== "" && (
                <div className="rounded-md border border-zinc-800/50 bg-zinc-900/30 p-3 text-xs text-zinc-400">
                  Manual address is filled and will be submitted together with map location.
                </div>
              )}
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
