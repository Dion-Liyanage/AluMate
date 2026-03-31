"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, History, ChevronDown, ChevronUp } from "lucide-react";
import { ServiceRequest } from "./ServiceManagement";
import { ServiceStatusBadge, ServiceTypeBadge } from "./ServiceStatusBadge";
import { ServiceDetailsModal } from "./ServiceDetailsModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const INACTIVE_STATUSES = ["Completed", "Rejected", "Cancelled by Customer"];

interface ServiceTableProps {
  services: ServiceRequest[];
  onRefresh?: () => void;
}

export function ServiceTable({ services, onRefresh }: ServiceTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const activeRequests = services.filter(s => !INACTIVE_STATUSES.includes(s.status));
  const inactiveRequests = services.filter(s => INACTIVE_STATUSES.includes(s.status));

  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400 font-semibold w-[120px] text-center">ID</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Service Type</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Customer</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Submitted Date</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Status</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRequests.length === 0 && inactiveRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  No service requests found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Active Requests */}
                {activeRequests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(request)}
                  >
                    <TableCell className="font-medium text-zinc-300 text-center">
                      {request.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <ServiceTypeBadge type={request.serviceType} />
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-center">
                      {request.customerName}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {request.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <ServiceStatusBadge status={request.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-fuchsia-400 hover:bg-fuchsia-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(request);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Standalone Toggle Button - User side style */}
      {inactiveRequests.length > 0 && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 h-9 px-4"
          >
            {showInactive ? (
              <ChevronUp className="mr-2 h-4 w-4" />
            ) : (
              <ChevronDown className="mr-2 h-4 w-4" />
            )}
            {showInactive ? "Hide Inactive Requests" : "Show Inactive Requests"}
          </Button>

          <AnimatePresence>
            {showInactive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full rounded-xl border border-zinc-800/40 bg-zinc-950/30 overflow-hidden backdrop-blur-md"
              >
                <div className="px-5 py-3 bg-zinc-900/60 border-b border-zinc-800/40 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                    <History className="h-4 w-4 text-fuchsia-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">Completed and User Cancelled Requests</span>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800/40 bg-zinc-900/20">
                        <TableHead className="text-zinc-400 font-semibold w-[120px] text-center uppercase">ID</TableHead>
                        <TableHead className="text-zinc-400 font-semibold text-center uppercase">Service Type</TableHead>
                        <TableHead className="text-zinc-400 font-semibold text-center uppercase">Customer</TableHead>
                        <TableHead className="text-zinc-400 font-semibold text-center uppercase">Submitted Date</TableHead>
                        <TableHead className="text-zinc-400 font-semibold text-center uppercase">Status</TableHead>
                        <TableHead className="text-zinc-400 font-semibold text-center uppercase">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveRequests.map((request) => (
                        <TableRow 
                          key={request.id} 
                          className="border-zinc-800/20 bg-zinc-950/10 hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                          onClick={() => handleViewDetails(request)}
                        >
                          <TableCell className="font-medium text-zinc-300 text-center">
                            {request.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <ServiceTypeBadge type={request.serviceType} />
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300 text-center">
                            {request.customerName}
                          </TableCell>
                          <TableCell className="text-zinc-400 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                              {request.date}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <ServiceStatusBadge status={request.status} />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-fuchsia-400 hover:bg-fuchsia-400/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(request);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ServiceDetailsModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRefresh={onRefresh}
      />
    </div>
  );
}
