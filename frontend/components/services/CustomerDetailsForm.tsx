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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          placeholder="e.g. John Doe" 
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input 
          id="contactNumber" 
          placeholder="e.g. 0771234567" 
          value={formData.contactNumber}
          onChange={(e) => onChange("contactNumber", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nearestTown">Nearest Town</Label>
        <Input 
          id="nearestTown" 
          placeholder="e.g. Kalutara" 
          value={formData.nearestTown}
          onChange={(e) => onChange("nearestTown", e.target.value)}
        />
      </div>
    </div>
  );
}
