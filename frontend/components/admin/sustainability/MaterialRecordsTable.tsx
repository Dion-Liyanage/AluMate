"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sustainabilityApi, type MaterialUsageRecord } from "@/lib/api";
import { RecordMaterialUsageDialog } from "./RecordMaterialUsageDialog";

interface MaterialRecordsTableProps {
  /** Bump this to reload (e.g. after a new record is added elsewhere on the page). */
  refreshKey: number;
  /** Called after an edit or delete so the dashboard figures reload. */
  onChanged: () => void;
}

const kg = (value: number) => `${(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} kg`;
const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function MaterialRecordsTable({ refreshKey, onChanged }: MaterialRecordsTableProps) {
  const [records, setRecords] = useState<MaterialUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<MaterialUsageRecord | null>(null);
  const [deleting, setDeleting] = useState<MaterialUsageRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await sustainabilityApi.getRecords();
      setRecords(response.data ?? []);
    } catch (err) {
      console.error("Failed to load material records:", err);
      toast.error("Could not load material records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await sustainabilityApi.deleteRecord(deleting._id);
      toast.success("Material record deleted");
      setDeleting(null);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the record");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-100">Material Records</CardTitle>
        <p className="text-sm text-zinc-400">Every recorded job. Edit a record to correct its figures, or delete it.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">No material records yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900/60">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase text-zinc-500">Date</TableHead>
                  <TableHead className="text-[10px] uppercase text-zinc-500">Order / Project</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Purchased</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Used</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Offcuts</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Scrap</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Cost</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record._id} className="border-zinc-800/60 hover:bg-zinc-900/40">
                    <TableCell className="whitespace-nowrap text-xs text-zinc-400">{date(record.recordedAt)}</TableCell>
                    <TableCell className="text-sm text-zinc-200">
                      {record.orderNumber && (
                        <span className="mr-2 font-mono text-xs text-sky-400">{record.orderNumber}</span>
                      )}
                      {record.projectName}
                      {!record.orderId && (
                        <span className="ml-2 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500">
                          Historical
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-zinc-300">{kg(record.purchasedKg)}</TableCell>
                    <TableCell className="text-right text-sm text-zinc-300">{kg(record.usedKg)}</TableCell>
                    <TableCell className="text-right text-sm text-zinc-300">{kg(record.reusableOffcutsKg)}</TableCell>
                    <TableCell className="text-right text-sm text-zinc-300">{kg(record.scrapWasteKg)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm text-zinc-300">
                      Rs. {Math.round(record.totalCost).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Edit record"
                          onClick={() => setEditing(record)}
                          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Delete record"
                          onClick={() => setDeleting(record)}
                          className="h-8 w-8 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <RecordMaterialUsageDialog
        record={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
          onChanged();
        }}
      />

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {deleting?.orderNumber
                ? `The material figures for order ${deleting.orderNumber} will be removed from the dashboard and reports. The order itself is not deleted, and its fabrication can't be recorded again.`
                : "This record will be removed from the dashboard and reports."}{" "}
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)} className="text-zinc-400 hover:text-zinc-100">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-400"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
