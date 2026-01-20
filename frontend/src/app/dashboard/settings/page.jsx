"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, LogOut, Save, X, Moon, Sun } from "lucide-react";
import ImageUploading from "react-images-uploading";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeChatWith } from "@/app/(redux)/features/chatWith";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/app/(redux)/features/profile";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTheme } from "next-themes";

// Validation schema
const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  mobile: Yup.string()
    .matches(/^[0-9]*$/, "Mobile must contain only numbers")
    .optional(),
  description: Yup.string()
    .max(250, "Description must be 250 characters or less")
    .optional(),
});

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    mobile: "",
    description: "",
    avatar: "",
  });

  const maxNumber = 1;
  const maxMbFileSize = 5;

  const onChange = (imageList) => {
    setImages(imageList);
  };

  const dispatch = useDispatch();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/user/profile",
        {},
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        },
      );
      const userData = response.data.data;
      const values = {
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        description: userData.description || "",
        avatar: userData.avatar || "",
        status: userData.status || "offline",
      };
      setInitialValues(values);
      dispatch(updateProfile(values));
    } catch (error) {
      toast.error("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = new FormData();

      // Append all form data
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "avatar") {
          data.append(key, value);
        }
      });

      // Append the image if it exists
      if (images.length > 0) {
        data.append("avatar", images[0].file);
      }

      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/user/update-profile",
        data,
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        },
      );

      toast.success("Profile updated successfully!");

      // Refresh user data
      await fetchUserData();
      setImages([]);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    Cookies.remove("chat-token");
    router.push("/");
    toast.success("You have been logged out successfully!");
    dispatch(removeChatWith());
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl h-screen overflow-y-auto no-scrollbar">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={profileSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      {images.length > 0 ? (
                        <img
                          src={images[0].dataURL}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <AvatarImage src={initialValues.avatar} />
                          <AvatarFallback className="text-4xl">
                            {values.name ? (
                              values.name.charAt(0).toUpperCase()
                            ) : (
                              <User />
                            )}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </div>

                  <ImageUploading
                    multiple={false}
                    value={images}
                    onChange={onChange}
                    maxNumber={maxNumber}
                    dataURLKey="dataURL"
                    acceptType={["jpg", "jpeg", "png", "webp"]}
                    maxFileSize={maxMbFileSize * 1024 * 1024}
                  >
                    {({
                      imageList,
                      onImageUpload,
                      onImageRemove,
                      isDragging,
                      dragProps,
                      errors: uploadErrors,
                    }) => (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onImageUpload}
                          {...dragProps}
                          className={isDragging ? "bg-accent" : ""}
                        >
                          {imageList.length > 0
                            ? "Change Image"
                            : "Upload Image"}
                        </Button>

                        {imageList.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-destructive"
                            onClick={() => {
                              onImageRemove(0);
                              setImages([]);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}

                        {uploadErrors && (
                          <div className="text-xs text-destructive mt-2">
                            {uploadErrors.maxNumber && (
                              <div>
                                Number of selected images exceeds maximum
                                allowed
                              </div>
                            )}
                            {uploadErrors.acceptType && (
                              <div>Selected file type is not allowed</div>
                            )}
                            {uploadErrors.maxFileSize && (
                              <div>
                                File size is too large (max {maxMbFileSize}MB)
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG, or WEBP (max {maxMbFileSize}MB)
                        </p>
                      </div>
                    )}
                  </ImageUploading>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
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

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Field
                      as={Input}
                      id="mobile"
                      name="mobile"
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

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <div className="flex items-center p-2 border rounded-md bg-muted/50">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          initialValues.status === "online"
                            ? "bg-green-500"
                            : "bg-muted-foreground/50"
                        } mr-2`}
                      ></span>
                      <span className="capitalize">
                        {initialValues.status || "offline"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">About</Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      placeholder="Tell others about yourself..."
                      rows={4}
                      maxLength={250}
                      className={
                        errors.description && touched.description
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <div className="flex justify-between">
                      <ErrorMessage
                        name="description"
                        component="p"
                        className="text-xs text-red-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        {values.description?.length || 0}/250 characters
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/forgot-password"
                    className="-mt-4 text-primary hover:underline cursor-pointer"
                  >
                    Change Password?
                  </Link>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
