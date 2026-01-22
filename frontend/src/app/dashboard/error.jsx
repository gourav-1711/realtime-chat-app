"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DashboardError({ error, reset }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg border-red-200 dark:border-red-900">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 ring-8 ring-red-100 dark:ring-red-900/10">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-2xl">Oops! Something broke</CardTitle>
            <CardDescription className="mt-2">
              Don't worry, your messages are safe. Let's get you back on track.
            </CardDescription>
          </div>
        </CardHeader>
        {error?.message && (
          <CardContent>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 p-4">
              <p className="text-xs text-red-800 dark:text-red-200 font-mono break-words">
                {error.message}
              </p>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/home")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
