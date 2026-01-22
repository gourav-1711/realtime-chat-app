import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <div className="inline-block">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              404
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Page Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
          >
            <Link href="/dashboard/home">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
        <div className="pt-8">
          <Search className="h-32 w-32 text-gray-300 dark:text-gray-700 mx-auto opacity-50" />
        </div>
      </div>
    </div>
  );
}
