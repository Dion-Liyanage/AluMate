"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, LayoutGrid } from "lucide-react";
import { designsApi } from "@/lib/api";
import { toast } from "sonner";

interface Design {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
}

interface DesignTableProps {
  designs: Design[];
  onRefresh: () => void;
}

export function DesignTable({ designs, onRefresh }: DesignTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;
    
    setIsDeleting(id);
    try {
      await designsApi.delete(id);
      toast.success("Design deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete design");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
      <Table>
        <TableHeader className="bg-zinc-900/80">
          <TableRow className="hover:bg-transparent border-zinc-800">
            <TableHead className="text-zinc-400">Design</TableHead>
            <TableHead className="text-zinc-400">Category</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-right text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                No designs found in the catalogue.
              </TableCell>
            </TableRow>
          ) : (
            designs.map((design) => (
              <TableRow key={design._id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-medium text-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      {design.imageUrl ? (
                        <img src={design.imageUrl} alt={design.title} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <LayoutGrid className="h-5 w-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p>{design.title}</p>
                      <p className="text-xs text-zinc-500 font-normal truncate max-w-[200px]">{design.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-zinc-900 text-zinc-400 border-zinc-700 capitalize">
                    {design.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={design.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
                    {design.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => handleDelete(design._id)}
                      disabled={isDeleting === design._id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
