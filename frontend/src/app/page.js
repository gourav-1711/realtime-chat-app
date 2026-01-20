import { LoginForm } from "@/components/login-form";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "BlinkChat - Connect Instantly",
  description: "A modern real-time chat application built with Next.js",
};

export default function Home() {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-bold text-xl">
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white flex size-8 items-center justify-center rounded-lg shadow-lg">
                <MessageSquare className="size-5" />
              </div>
              BlinkChat
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
        <div className="relative hidden lg:block overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-teal-500 to-blue-600">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <div className="max-w-lg text-center space-y-6">
              {/* Floating chat bubbles animation */}
              <div className="relative h-64 mb-8">
                <div
                  className="absolute top-0 left-1/4 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl rounded-bl-none animate-bounce"
                  style={{ animationDelay: "0s", animationDuration: "3s" }}
                />
                <div
                  className="absolute top-8 right-1/4 w-20 h-12 bg-white/30 backdrop-blur-sm rounded-2xl rounded-br-none animate-bounce"
                  style={{ animationDelay: "0.5s", animationDuration: "3s" }}
                />
                <div
                  className="absolute top-24 left-1/3 w-24 h-14 bg-white/25 backdrop-blur-sm rounded-2xl rounded-bl-none animate-bounce"
                  style={{ animationDelay: "1s", animationDuration: "3s" }}
                />
                <div
                  className="absolute bottom-16 right-1/3 w-18 h-10 bg-white/20 backdrop-blur-sm rounded-2xl rounded-br-none animate-bounce"
                  style={{ animationDelay: "1.5s", animationDuration: "3s" }}
                />

                {/* Center icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-bold">
                Connect with anyone, anywhere
              </h2>
              <p className="text-lg text-white/80">
                Experience real-time messaging with a beautiful, modern
                interface. Share messages, images, and stay connected with the
                people who matter most.
              </p>

              <div className="flex justify-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm text-white/70">Free to use</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">Real-time</div>
                  <div className="text-sm text-white/70">Instant delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">Secure</div>
                  <div className="text-sm text-white/70">End-to-end</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
