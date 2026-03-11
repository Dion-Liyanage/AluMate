"use client";

import { motion } from "framer-motion";
import { FolderOpen, MapPin, ArrowRight } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder past projects
const projects = [
  {
    id: "1",
    name: "Kitchen Cupboard Set",
    location: "Colombo",
    material: "Aluminium",
    color: "Black",
    description: "Complete kitchen cabinet installation with soft-close hinges",
  },
  {
    id: "2",
    name: "Living Room Partition",
    location: "Kandy",
    material: "Aluminium + Frosted Glass",
    color: "Silver",
    description: "Modern glass partition dividing living and dining areas",
  },
  {
    id: "3",
    name: "Bedroom Sliding Windows",
    location: "Galle",
    material: "Aluminium + Tinted Glass",
    color: "Bronze",
    description: "Energy-efficient sliding windows with mosquito mesh",
  },
  {
    id: "4",
    name: "Balcony Railing",
    location: "Negombo",
    material: "Aluminium + Tempered Glass",
    color: "Black",
    description: "Frameless glass railing with aluminium handrail",
  },
  {
    id: "5",
    name: "Entrance Double Door",
    location: "Colombo",
    material: "Aluminium + Glass",
    color: "Dark Grey",
    description: "Premium entrance door with digital lock integration",
  },
  {
    id: "6",
    name: "Office Partition System",
    location: "Colombo",
    material: "Aluminium + Clear Glass",
    color: "Silver",
    description: "Full-floor office partition with soundproofing",
  },
];

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Past Projects">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-emerald-400" />
            Past Projects Gallery
          </h2>
          <p className="mt-1 text-zinc-400">
            Explore completed fabrication projects for inspiration.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-emerald-500/40 transition-all group overflow-hidden cursor-pointer hover:shadow-[0_0_20px_rgba(52,211,153,0.08)]">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                {/* Placeholder image */}
                <div className="relative h-44 bg-zinc-800/50 flex items-center justify-center border-b border-zinc-800">
                  <div className="text-zinc-600 text-sm">Project Photo</div>
                </div>
                <CardContent className="relative p-4">
                  <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {project.location}
                  </div>
                  <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="text-zinc-400 border-zinc-700 text-xs"
                      >
                        {project.material}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-zinc-400 border-zinc-700 text-xs"
                      >
                        {project.color}
                      </Badge>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-zinc-500 group-hover:text-emerald-400 transition-colors">
                      View
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
