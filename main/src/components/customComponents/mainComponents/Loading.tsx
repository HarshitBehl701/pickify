import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-gray-700">Loading, please wait...</p>
      </div>
    </div>
  );
}
