import {
  MapPin,
  Camera,
  CheckSquare,
  CheckCircle,
  List,
  Settings,
  Wrench,
  Shield,
} from "lucide-react";

// Icon mapping for different action keys
export const getStepIcon = (actionKey: string) => {
  switch (actionKey.toLowerCase()) {
    case "checkin":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <MapPin className="w-4 h-4 text-white" />
        </div>
      );
    case "equipment-check":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Wrench className="w-4 h-4 text-white" />
        </div>
      );
    case "ppe-check":
    case "ai-ppe-check":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
      );
    case "photo-capture":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      );
    case "checklist":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
      );
    case "finish":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      );
    case "list":
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <List className="w-4 h-4 text-white" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
      );
  }
};
