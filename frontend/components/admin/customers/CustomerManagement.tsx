"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  X,
  Loader2,
  Eye,
  Users,
  Mail,
  Phone,
  ShoppingBag,
  RefreshCw,
  UserX,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { adminCustomersApi } from "@/lib/api";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { CustomerDetailsModal } from "./CustomerDetailsModal";
import type { User, Order } from "@/types";

// Extended customer interface with computed fields
export interface CustomerWithStats extends User {
  totalOrders?: number;
  status?: string;
  _id?: string;
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { search?: string; isActive?: boolean } = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "inactive") params.isActive = false;

      const response = await adminCustomersApi.getAll(params);
      if (response.success && response.data) {
        const mapped = response.data.customers.map((c: any) => ({
          ...c,
          id: c._id || c.id,
          status: c.isActive === false ? "Inactive" : "Active",
          totalOrders: c.totalOrders ?? 0,
        }));
        setCustomers(mapped);
      }
    } catch (err: any) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewDetails = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasFilters = searchQuery !== "" || statusFilter !== "all";

  // Client-side filtering for immediate responsiveness
  const filteredCustomers = customers.filter((customer) => {
    const fullName =
      `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      fullName.includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && customer.status === "Active") ||
      (statusFilter === "inactive" && customer.status === "Inactive");

    return matchesSearch && matchesStatus;
  });

  const activeCount = customers.filter((c) => c.status === "Active").length;
  const inactiveCount = customers.filter((c) => c.status === "Inactive").length;

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
          <div className="relative flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 flex items-center justify-center border border-zinc-800">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {isLoading ? "—" : customers.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
          <div className="relative flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-zinc-800">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Active
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {isLoading ? "—" : activeCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
          <div className="relative flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-zinc-500/20 to-zinc-600/10 flex items-center justify-center border border-zinc-800">
              <UserX className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Inactive
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {isLoading ? "—" : inactiveCount}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:ring-violet-500/20"
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
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
            onClick={fetchCustomers}
            className="text-zinc-500 hover:text-zinc-300 h-9 px-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {!isLoading && "Refresh"}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCustomers}
            className="mt-2 text-red-300 hover:text-red-200"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500/60" />
          <p className="text-sm text-zinc-500">Loading customers...</p>
        </div>
      )}

      {/* Customer Table */}
      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-zinc-500">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 font-semibold text-center">
                      Customer
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">
                      Email
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">
                      Phone
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">
                      Orders
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-zinc-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-zinc-700" />
                          <p>No customers found matching your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                        onClick={() => handleViewDetails(customer)}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 shrink-0">
                              {customer.firstName?.[0]}
                              {customer.lastName?.[0]}
                            </div>
                            <span className="text-sm font-medium text-zinc-200">
                              {customer.firstName} {customer.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2 justify-center text-sm text-zinc-400">
                            <Mail className="h-3.5 w-3.5 text-zinc-600" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2 justify-center text-sm text-zinc-400">
                            <Phone className="h-3.5 w-3.5 text-zinc-600" />
                            {customer.phone || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2 justify-center text-sm text-zinc-300">
                            <ShoppingBag className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="font-medium">
                              {customer.totalOrders ?? 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <CustomerStatusBadge
                              status={customer.status || "Active"}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-violet-400 hover:bg-violet-400/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(customer);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRefresh={fetchCustomers}
      />
    </div>
  );
}
