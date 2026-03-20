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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">On-Site Visit Request</CardTitle>
              <CardDescription>
                Schedule an expert to visit your location for exact measurements and consultation.
              </CardDescription>
            </div>
            {status !== "Draft" && <RequestStatusBadge status={status} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scheduling Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <DateSelector value={selectedDate} onChange={(val) => {
              setSelectedDate(val);
              setSelectedSlot(""); // Reset slot when date changes
            }} />
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Available Time Slots
              </label>
              <TimeSlotSelector 
                selectedDate={selectedDate} 
                selectedSlot={selectedSlot} 
                onSelect={setSelectedSlot} 
              />
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Details</h3>
            <CustomerDetailsForm formData={formData} onChange={handleFormChange} />
          </div>

          <Separator />

          {/* Location Placeholder */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>
            <div className="rounded-lg border bg-muted/50 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="bg-background rounded-full p-3 shadow-sm">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Location Selection</p>
                <p className="text-sm text-muted-foreground">This feature will be available in Section 2.</p>
              </div>
              <Button disabled variant="outline" className="mt-2" type="button">
                Select Location on Map
              </Button>
            </div>
          </div>
          
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid || status === "Request Sent" || status === "Approved"}
          >
            {status === "Draft" ? "Submit Request" : "Request Already Submitted"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
