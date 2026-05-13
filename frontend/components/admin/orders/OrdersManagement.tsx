"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, X, Loader2, RotateCw } from "lucide-react";
import { OrdersTable, Order } from "./OrdersTable";

const mockOrders: Order[] = [
  {
    id: "ALU-ORD-2024-001",
    customerName: "Dion Perera",
    productType: "Sliding Window",
    designType: 'Custom',
    price: "Rs. 45,000",
    status: 'production',
    progress: 65,
    date: "2024-05-10"
  },
  {
    id: "ALU-ORD-2024-002",
    customerName: "Amara Silva",
    productType: "Main Door",
    designType: 'Catalogue',
    price: "Rs. 120,000",
    status: 'approved',
    progress: 25,
    date: "2024-05-12"
  },
  {
    id: "ALU-ORD-2024-003",
    customerName: "Kushan Perera",
    productType: "Kitchen Pantry",
    designType: 'Custom',
    price: "Rs. 250,000",
    status: 'quotation_pending',
    progress: 10,
    date: "2024-05-13"
  },
  {
    id: "ALU-ORD-2024-004",
    customerName: "Nimini Fernando",
    productType: "Office Partition",
    designType: 'Custom',
    price: "Rs. 85,000",
    status: 'installation',
    progress: 85,
    date: "2024-05-14"
  },
  {
    id: "ALU-ORD-2024-005",
    customerName: "Saman Kumara",
    productType: "Glass Railing",
    designType: 'Catalogue',
    price: "Rs. 65,000",
    status: 'completed',
    progress: 100,
    date: "2024-05-15"
  }
];

export function OrdersManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      // 1. Tab Filtering (Design Type)
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "custom" && order.designType === "Custom") ||
        (activeTab === "catalogue" && order.designType === "Catalogue");
      
      // 2. Search Query (ID, Customer, Product)
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productType.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. Status Filtering
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [activeTab, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasFilters = searchQuery !== "" || statusFilter !== "all";

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Container */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by customer, product or Order ID..." 
              className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:ring-emerald-500/20"
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="quotation_pending">Quotation Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="production">In Production</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
            onClick={handleRefresh}
            className="text-zinc-500 hover:text-zinc-300 h-9 px-3"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <RotateCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs and Table Container */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-zinc-950 border border-zinc-800 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 font-bold uppercase text-[10px] tracking-widest px-6">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-purple-400 font-bold uppercase text-[10px] tracking-widest px-6">
              Custom Designs
            </TabsTrigger>
            <TabsTrigger value="catalogue" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 font-bold uppercase text-[10px] tracking-widest px-6">
              Catalogue
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Fabrication Pipeline
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <OrdersTable orders={filteredOrders} />
        </TabsContent>
        <TabsContent value="custom" className="mt-0">
          <OrdersTable orders={filteredOrders} />
        </TabsContent>
        <TabsContent value="catalogue" className="mt-0">
          <OrdersTable orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
