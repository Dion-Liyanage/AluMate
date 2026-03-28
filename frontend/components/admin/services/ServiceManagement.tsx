"use client";

import { useState } from "react";
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
import { Search, Filter, X } from "lucide-react";
import { ServiceTable } from "./ServiceTable";

// Unified Service Request Interface
export interface ServiceRequest {
  id: string;
  userId: string;
  customerName: string;
  serviceType: "on-site-visit" | "repair";
  status: string;
  date: string;
  location?: { lat: number; lng: number } | string;
  issueDescription?: string;
  orderId?: string;
  createdAt: string;
}

// Mock Data as per admin-service.md
const MOCK_SERVICES: ServiceRequest[] = [
  {
    id: "SRV-1001",
    userId: "U001",
    customerName: "Dion Perera",
    serviceType: "on-site-visit",
    status: "Pending",
    date: "2026-04-05",
    location: "Kandy, Central Province",
    createdAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "SRV-1002",
    userId: "U002",
    customerName: "Nimal Silva",
    serviceType: "repair",
    status: "Approved",
    date: "2026-03-28",
    orderId: "ORD-5021",
    issueDescription: "Sliding door track is jammed and making noise.",
    createdAt: "2026-03-26T08:30:00Z",
  },
  {
    id: "SRV-1003",
    userId: "U003",
    customerName: "Kamal Gunawardena",
    serviceType: "on-site-visit",
    status: "In Progress",
    date: "2026-04-02",
    location: "Colombo 07",
    createdAt: "2026-03-24T15:45:00Z",
  },
  {
    id: "SRV-1004",
    userId: "U004",
    customerName: "Samanthi Fernando",
    serviceType: "repair",
    status: "Request Sent",
    date: "2026-04-10",
    orderId: "ORD-3044",
    issueDescription: "Window handle is broken and needs replacement.",
    createdAt: "2026-03-27T12:00:00Z",
  },
];

export function ServiceManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredServices = MOCK_SERVICES.filter((service) => {
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
      </div>

      {/* Tabs and Table */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-zinc-950 border border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-fuchsia-400">
              All Requests
            </TabsTrigger>
            <TabsTrigger value="on-site-visit" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-400">
              On-Site Visits
            </TabsTrigger>
            <TabsTrigger value="repair" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-400">
              Repair Requests
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden sm:block text-xs text-zinc-500">
            Showing {filteredServices.length} requests
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <ServiceTable services={filteredServices} />
        </TabsContent>
        <TabsContent value="on-site-visit" className="mt-0">
          <ServiceTable services={filteredServices} />
        </TabsContent>
        <TabsContent value="repair" className="mt-0">
          <ServiceTable services={filteredServices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
