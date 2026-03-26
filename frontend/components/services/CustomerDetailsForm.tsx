import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerDetailsProps {
  formData: {
    fullName: string;
    contactNumber: string;
    nearestTown: string;
  };
  onChange: (field: string, value: string) => void;
}

export function CustomerDetailsForm({ formData, onChange }: CustomerDetailsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
        <Input 
          id="fullName" 
          placeholder="e.g. John Doe" 
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          className="!bg-zinc-800/80 border-zinc-700 text-zinc-100 focus-visible:ring-zinc-700 placeholder:text-zinc-400 [color-scheme:dark] autofill:shadow-[inset_0_0_0px_1000px_rgba(39,39,42,0.8)] autofill:[-webkit-text-fill-color:#f4f4f5]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactNumber" className="text-zinc-300">Contact Number</Label>
        <Input 
          id="contactNumber" 
          placeholder="e.g. 0771234567" 
          value={formData.contactNumber}
          onChange={(e) => onChange("contactNumber", e.target.value)}
          className="!bg-zinc-800/80 border-zinc-700 text-zinc-100 focus-visible:ring-zinc-700 placeholder:text-zinc-400 [color-scheme:dark] autofill:shadow-[inset_0_0_0px_1000px_rgba(39,39,42,0.8)] autofill:[-webkit-text-fill-color:#f4f4f5]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nearestTown" className="text-zinc-300">Nearest Town</Label>
        <Input 
          id="nearestTown" 
          placeholder="e.g. Kalutara" 
          value={formData.nearestTown}
          onChange={(e) => onChange("nearestTown", e.target.value)}
          className="!bg-zinc-800/80 border-zinc-700 text-zinc-100 focus-visible:ring-zinc-700 placeholder:text-zinc-400 [color-scheme:dark] autofill:shadow-[inset_0_0_0px_1000px_rgba(39,39,42,0.8)] autofill:[-webkit-text-fill-color:#f4f4f5]"
        />
      </div>
    </div>
  );
}
