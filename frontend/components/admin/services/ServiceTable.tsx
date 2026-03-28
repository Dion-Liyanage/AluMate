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
import { Eye, Clock, User, Calendar } from "lucide-react";
import { ServiceRequest } from "./ServiceManagement";
import { ServiceStatusBadge, ServiceTypeBadge } from "./ServiceStatusBadge";
import { ServiceDetailsModal } from "./ServiceDetailsModal";

interface ServiceTableProps {
  services: ServiceRequest[];
  onRefresh?: () => void;
}

export function ServiceTable({ services, onRefresh }: ServiceTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              <TableHead className="text-zinc-400 font-semibold text-center">Scheduled Date</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Status</TableHead>
              <TableHead className="text-zinc-400 font-semibold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  No service requests found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              services.map((request) => (
                <TableRow 
                  key={request.id} 
                  className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group"
                >
                  <TableCell className="font-medium text-zinc-300 text-center">
                    {request.id}
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
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceDetailsModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRefresh={onRefresh}
      />
    </div>
  );
}
