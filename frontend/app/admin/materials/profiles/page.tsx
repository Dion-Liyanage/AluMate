"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileDialog } from "@/components/admin/materials/ProfileDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminMaterialsApi } from "@/lib/api";
import { formatLKR } from "@/lib/units";
import type { MaterialProfile } from "@/types";

export default function AluminiumProfilesPage() {
  const [profiles, setProfiles] = useState<MaterialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialProfile | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminMaterialsApi.getProfiles();
      setProfiles(response.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const seriesList = useMemo(() => [...new Set(profiles.map((p) => p.series))].sort(), [profiles]);

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = profiles.filter(
      (p) =>
        !query ||
        p.code.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.series.toLowerCase().includes(query)
    );
    const groups = new Map<string, MaterialProfile[]>();
    for (const profile of filtered) {
      groups.set(profile.series, [...(groups.get(profile.series) ?? []), profile]);
    }
    return Array.from(groups.entries());
  }, [profiles, search]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (profile: MaterialProfile) => {
    setEditing(profile);
    setDialogOpen(true);
  };

  const handleDelete = async (profile: MaterialProfile) => {
    if (pendingDelete !== profile._id) {
      setPendingDelete(profile._id);
      return;
    }
    try {
      await adminMaterialsApi.deleteProfile(profile._id);
      toast.success(`${profile.code} deleted`);
      loadProfiles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete profile");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <DashboardLayout title="Aluminium Profiles">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                <Boxes className="h-5 w-5 text-sky-100" />
              </span>
              Aluminium Profiles
            </h2>
            <p className="mt-1 text-zinc-400">
              The extrusions your workshop buys. Product templates use these to build cut lists.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={loadProfiles}
              disabled={isLoading}
              className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={openCreate}
              className="gap-2 border border-sky-500/40 bg-sky-500/20 font-semibold text-white hover:bg-sky-500/30"
            >
              <Plus className="h-4 w-4" />
              Add Profile
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search code, name or series..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-zinc-800 bg-zinc-900/50 pl-9"
          />
        </div>

        {isLoading && profiles.length === 0 ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-600" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-14 text-center text-zinc-500">
            No profiles found.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([series, items]) => (
              <div key={series} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">{series}</h3>
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/40">
                  <Table>
                    <TableHeader className="bg-zinc-900/40">
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase text-zinc-500">Code</TableHead>
                        <TableHead className="text-[10px] uppercase text-zinc-500">Name</TableHead>
                        <TableHead className="text-[10px] uppercase text-zinc-500">Shape</TableHead>
                        <TableHead className="text-right text-[10px] uppercase text-zinc-500">Thickness</TableHead>
                        <TableHead className="text-right text-[10px] uppercase text-zinc-500">kg / m</TableHead>
                        <TableHead className="text-right text-[10px] uppercase text-zinc-500">Bar</TableHead>
                        <TableHead className="text-right text-[10px] uppercase text-zinc-500">Price / ft</TableHead>
                        <TableHead className="text-[10px] uppercase text-zinc-500">Status</TableHead>
                        <TableHead className="w-24" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((profile) => (
                        <TableRow key={profile._id} className="border-zinc-800/60">
                          <TableCell className="font-mono text-xs text-sky-300">{profile.code}</TableCell>
                          <TableCell className="text-sm text-zinc-200">{profile.name}</TableCell>
                          <TableCell className="text-xs capitalize text-zinc-400">{profile.shape}</TableCell>
                          <TableCell className="text-right text-xs text-zinc-300">{profile.thicknessMm} mm</TableCell>
                          <TableCell className="text-right text-xs text-zinc-300">{profile.weightKgPerM}</TableCell>
                          <TableCell className="text-right text-xs text-zinc-300">{profile.barLengthFt} ft</TableCell>
                          <TableCell className="text-right text-xs text-zinc-200">{formatLKR(profile.pricePerFt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                  profile.isActive
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-zinc-700 bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {profile.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEdit(profile)}
                                className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                                aria-label={`Edit ${profile.code}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size={pendingDelete === profile._id ? "sm" : "icon"}
                                variant="ghost"
                                onClick={() => handleDelete(profile)}
                                onBlur={() => setPendingDelete(null)}
                                className={`h-8 ${
                                  pendingDelete === profile._id
                                    ? "bg-red-500/15 px-2 text-xs text-red-300 hover:bg-red-500/25"
                                    : "w-8 text-zinc-500 hover:text-red-400"
                                }`}
                                aria-label={`Delete ${profile.code}`}
                              >
                                {pendingDelete === profile._id ? "Confirm" : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        profile={editing}
        existingSeries={seriesList}
        onSaved={loadProfiles}
      />
    </DashboardLayout>
  );
}
