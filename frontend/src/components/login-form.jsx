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
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";

// Validation schemas
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  mobile: Yup.string()
    .matches(/^[0-9]*$/, "Mobile must contain only numbers")
    .optional(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export function LoginForm({ className, ...props }) {
  const [mode, setMode] = useState("login");
  const router = useRouter();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/user/login",
        values,
      );
      toast.success("Login successful");
      Cookies.set("chat-token", res.data.token, {
        expires: 7,
        path: "/",
        sameSite: "lax",
        secure: true,
      });
      router.push("/dashboard/home");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/user/register",
        {
          name: values.name,
          email: values.email,
          password: values.password,
          mobile: values.mobile,
        },
      );
      toast.success("Registration successful");
      Cookies.set("chat-token", res.data.token, {
        expires: 7,
        path: "/",
        sameSite: "lax",
        secure: true,
      });
      router.push("/dashboard/home");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL + "/auth/google";
  };

  return (
    <>
      {mode === "login" && (
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className={cn("flex flex-col gap-6", className)} {...props}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to login to your account
                </p>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    name="email"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className={
                      errors.email && touched.email ? "border-red-500" : ""
                    }
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/dashboard/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Field
                    as={Input}
                    name="password"
                    id="password"
                    type="password"
                    className={
                      errors.password && touched.password
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="underline underline-offset-4 cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {mode === "register" && (
        <Formik
          initialValues={{
            name: "",
            email: "",
            mobile: "",
            password: "",
            confirm_password: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className={cn("flex flex-col gap-6", className)} {...props}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Field
                    as={Input}
                    name="name"
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className={
                      errors.name && touched.name ? "border-red-500" : ""
                    }
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    name="email"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className={
                      errors.email && touched.email ? "border-red-500" : ""
                    }
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile (Optional)</Label>
                  <Field
                    as={Input}
                    name="mobile"
                    id="mobile"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className={
                      errors.mobile && touched.mobile ? "border-red-500" : ""
                    }
                  />
                  <ErrorMessage
                    name="mobile"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    name="password"
                    id="password"
                    type="password"
                    className={
                      errors.password && touched.password
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Field
                    as={Input}
                    name="confirm_password"
                    id="confirm_password"
                    type="password"
                    className={
                      errors.confirm_password && touched.confirm_password
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <ErrorMessage
                    name="confirm_password"
                    component="p"
                    className="text-xs text-red-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="underline underline-offset-4 cursor-pointer"
                >
                  Login
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
}
