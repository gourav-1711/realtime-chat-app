import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-green-600 animate-ping opacity-20"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading BlinkChat
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we prepare your experience...
          </p>
        </div>
      </div>
    </div>
  );
}
