"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import Cookies from "js-cookie";

export function LoginForm({ className, ...props }) {
  const [mode, setMode] = useState("login");

  const router = useRouter();

  const login = (e) => {
    e.preventDefault();

    if (e.target.email.value == "" || e.target.password.value == "") {
      toast.error("All fields are required");
      return;
    }

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/user/login", {
        email: e.target.email.value,
        password: e.target.password.value,
      })
      .then((res) => {
        console.log(res);
        toast.success("Login successful");
        Cookies.set("chat-token", res.data.token ,{
          expires: 7,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
        router.push("/dashboard/home");
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.message || err.message || "Login failed"
        );
      });
  };

  const register = (e) => {
    e.preventDefault();

    if (
      e.target.name.value == "" ||
      e.target.email.value == "" ||
      e.target.password.value == ""
    ) {
      toast.error("All fields are required");
      return;
    }

    if (e.target.password.value !== e.target.confirm_password.value) {
      toast.error("Passwords do not match");
      return;
    }

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/user/register", {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
      })
      .then((res) => {
        console.log(res);
        toast.success("Register successful");
        Cookies.set("chat-token", res.data.token ,{
          expires: 7,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
        router.push("/dashboard/home");
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.message || err.message || "Register failed"
        );
      });
  };

  return (
    <>
      {mode === "login" && (
        <form
          onSubmit={login}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input name="password" id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              onClick={() => setMode("register")}
              className="underline underline-offset-4 cursor-pointer"
            >
              Sign up
            </a>
          </div>
        </form>
      )}
      {mode == "register" && (
        <form
          onSubmit={register}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                name="name"
                id="name"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                name="mobile"
                id="mobile"
                type="number"
                placeholder="you can add later"
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input name="password" id="password" type="password" required />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="confirm_password">Confirm Password</Label>
              </div>
              <Input
                name="confirm_password"
                id="confirm_password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Register
            </Button>
          </div>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a
              onClick={() => setMode("login")}
              className="underline underline-offset-4 cursor-pointer"
            >
              Login
            </a>
          </div>
        </form>
      )}
    </>
  );
}
