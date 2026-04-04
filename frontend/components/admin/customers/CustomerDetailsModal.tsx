"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Wrench,
  ClipboardList,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { adminCustomersApi } from "@/lib/api";
import { toast } from "sonner";
import type { CustomerWithStats } from "./CustomerManagement";
import type { Order } from "@/types";

interface CustomerDetailsModalProps {
  customer: CustomerWithStats | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

interface CustomerDetail {
  customer: CustomerWithStats;
  orders: Order[];
  serviceRequests?: any[];
}

export function CustomerDetailsModal({
  customer,
  isOpen,
  onOpenChange,
  onRefresh,
}: CustomerDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [details, setDetails] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    if (customer && isOpen) {
      fetchCustomerDetails(customer.id);
    }
  }, [customer, isOpen]);

  const fetchCustomerDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await adminCustomersApi.getById(id);
      if (response.success && response.data) {
        setDetails({
          customer: {
            ...response.data.customer,
            id: (response.data.customer as any)._id || response.data.customer.id,
            status:
              (response.data.customer as any).isActive === false
                ? "Inactive"
                : "Active",
          },
          orders: response.data.orders || [],
          serviceRequests: (response.data as any).serviceRequests || [],
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch customer details:", err);
      toast.error("Failed to load customer details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    setIsUpdating(true);
    try {
      const newActive =
        customer.status === "Active" ? false : true;
      await adminCustomersApi.update(customer.id, {
        isActive: newActive,
      } as any);
      toast.success(
        `Customer ${newActive ? "activated" : "deactivated"} successfully.`
      );
      onRefresh?.();
      onOpenChange(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update customer status.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!customer) return null;

  const displayCustomer = details?.customer || customer;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-xl">
                <div className="inline-flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300">
                    {displayCustomer.firstName?.[0]}
                    {displayCustomer.lastName?.[0]}
                  </div>
                  <span className="whitespace-nowrap">
                    {displayCustomer.firstName} {displayCustomer.lastName}
                  </span>
                </div>
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Customer profile and activity overview
              </DialogDescription>
            </div>
            <CustomerStatusBadge
              status={displayCustomer.status || "Active"}
            />
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500/60" />
            <p className="text-sm text-zinc-500">Loading customer details...</p>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 text-violet-400" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-zinc-500 font-bold">
                        Email
                      </p>
                      <p className="text-sm text-zinc-200">
                        {displayCustomer.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-0.5 text-violet-400" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-zinc-500 font-bold">
                        Phone
                      </p>
                      <p className="text-sm text-zinc-200">
                        {displayCustomer.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-violet-400" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-zinc-500 font-bold">
                        Address
                      </p>
                      <p className="text-sm text-zinc-200">
                        {displayCustomer.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-violet-400" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-zinc-500 font-bold">
                        Joined
                      </p>
                      <p className="text-sm text-zinc-200">
                        {displayCustomer.createdAt
                          ? new Date(
                              displayCustomer.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Order History */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order History
                {details?.orders && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-zinc-700 bg-zinc-900 text-zinc-400 ml-1"
                  >
                    {details.orders.length}
                  </Badge>
                )}
              </h4>
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/30 overflow-hidden">
                {details?.orders && details.orders.length > 0 ? (
                  <div className="divide-y divide-zinc-800/30">
                    {details.orders.slice(0, 10).map((order: any) => (
                      <div
                        key={order._id || order.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <ClipboardList className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">
                              {order.title || `Order #${(order._id || order.id)?.substring(0, 8)}`}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase tracking-wider",
                            order.status === "completed"
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : order.status === "cancelled"
                              ? "border-red-500/30 text-red-400 bg-red-500/10"
                              : order.status === "in-progress"
                              ? "border-blue-500/30 text-blue-400 bg-blue-500/10"
                              : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                          )}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                    {details.orders.length > 10 && (
                      <div className="px-4 py-2 text-center">
                        <p className="text-[11px] text-zinc-500">
                          +{details.orders.length - 10} more orders
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <ShoppingBag className="h-8 w-8 text-zinc-700" />
                    <p className="text-sm text-zinc-500">
                      No orders placed yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Requests */}
            {details?.serviceRequests && details.serviceRequests.length > 0 && (
              <>
                <Separator className="bg-zinc-800/50" />
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Service Requests
                    <Badge
                      variant="outline"
                      className="text-[10px] border-zinc-700 bg-zinc-900 text-zinc-400 ml-1"
                    >
                      {details.serviceRequests.length}
                    </Badge>
                  </h4>
                  <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/30 overflow-hidden">
                    <div className="divide-y divide-zinc-800/30">
                      {details.serviceRequests
                        .slice(0, 5)
                        .map((service: any) => (
                          <div
                            key={service._id || service.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-lg border flex items-center justify-center",
                                  service.serviceType === "repair"
                                    ? "bg-cyan-500/10 border-cyan-500/20"
                                    : "bg-fuchsia-500/10 border-fuchsia-500/20"
                                )}
                              >
                                <Wrench
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    service.serviceType === "repair"
                                      ? "text-cyan-400"
                                      : "text-fuchsia-400"
                                  )}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-200 capitalize">
                                  {service.serviceType?.replace("-", " ") ||
                                    "Service Request"}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  {service.date ||
                                    (service.createdAt
                                      ? new Date(
                                          service.createdAt
                                        ).toLocaleDateString()
                                      : "—")}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase tracking-wider",
                                service.status === "Completed"
                                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                  : service.status === "Rejected"
                                  ? "border-red-500/30 text-red-400 bg-red-500/10"
                                  : service.status === "Approved" ||
                                    service.status === "In Progress"
                                  ? "border-blue-500/30 text-blue-400 bg-blue-500/10"
                                  : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                              )}
                            >
                              {service.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account Management */}
            <Separator className="bg-zinc-800/50" />
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account Management
              </h4>
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Account Status
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {displayCustomer.status === "Active"
                        ? "This customer can access the system normally."
                        : "This customer is blocked from performing actions."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isUpdating}
                    className={cn(
                      "transition-all font-semibold text-xs",
                      displayCustomer.status === "Active"
                        ? "bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/50"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-200 hover:border-emerald-500/50"
                    )}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : displayCustomer.status === "Active" ? (
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {displayCustomer.status === "Active"
                      ? "Disable Customer"
                      : "Enable Customer"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-zinc-800 pt-4 mt-2">
          <Button
            variant="outline"
            className="bg-zinc-800/40 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800/60 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)]"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
