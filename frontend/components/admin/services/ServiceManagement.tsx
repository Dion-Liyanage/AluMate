"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { ServiceTable } from "./ServiceTable";
import { servicesApi } from "@/lib/api";

// Unified Service Request Interface
export interface ServiceRequest {
  id: string;
  _id?: string;
  userId: string;
  customerName: string;
  serviceType: "on-site-visit" | "repair";
  status: string;
  date: string;
  // On-site visit fields
  timeSlot?: string;
  contactNumber?: string;
  nearestTown?: string;
  location?: { lat: number; lng: number } | string;
  manualAddress?: string;
  // Repair fields
  issueDescription?: string;
  orderId?: string;
  imageUrl?: string;
  // Admin fields
  adminNotes?: string;
  createdAt: string;
}

export function ServiceManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service requests from the API
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getAll();
      if (response.success && response.data) {
        // Map backend _id to id for frontend compatibility
        const mapped = response.data.serviceRequests.map((s: any) => ({
          ...s,
          id: s._id || s.id,
          userId: s.customerId,
        }));
        setServices(mapped);
      }
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load service requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services.filter((service) => {
    const matchesTab = activeTab === "all" || service.serviceType === activeTab;
    const matchesSearch = 
      service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasFilters = searchQuery !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by customer or Request ID..." 
              className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:ring-fuchsia-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-zinc-950/50 border-zinc-800 text-zinc-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Request Sent">Request Sent</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-zinc-500 hover:text-zinc-300 h-9 px-3"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchServices}
            className="text-zinc-500 hover:text-zinc-300 h-9 px-3"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchServices} className="mt-2 text-red-300 hover:text-red-200">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      )}

      {/* Tabs and Table */}
      {!isLoading && !error && (
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-zinc-950 border border-zinc-800">
              <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-fuchsia-400">
                All Requests
              </TabsTrigger>
              <TabsTrigger value="on-site-visit" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-fuchsia-400">
                On-Site Visits
              </TabsTrigger>
              <TabsTrigger value="repair" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-cyan-400">
                Repair Requests
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden sm:block text-xs text-zinc-500">
              Showing {filteredServices.length} requests
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <ServiceTable services={filteredServices} onRefresh={fetchServices} />
          </TabsContent>
          <TabsContent value="on-site-visit" className="mt-0">
            <ServiceTable services={filteredServices} onRefresh={fetchServices} />
          </TabsContent>
          <TabsContent value="repair" className="mt-0">
            <ServiceTable services={filteredServices} onRefresh={fetchServices} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
