"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google authentication failed. Please try again.");
      router.push("/");
      return;
    }

    if (token) {
      // Store token in cookies
      Cookies.set("chat-token", token, {
        expires: 7,
        path: "/",
        sameSite: "lax",
        secure: true,
      });

      toast.success("Successfully signed in with Google!");
      router.push("/dashboard/home");
    } else {
      toast.error("No authentication token received.");
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
