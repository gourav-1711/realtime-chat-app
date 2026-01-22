"use client";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader2, Mail, Phone, User, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { openLightBox } from "@/app/(redux)/features/lightBox";


export function ProfilePageContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();
  const userId = useSelector((state) => state.chatWith.chatWith);
  const isSelf = params.get("view") === "self";
  const [media, setMedia] = useState([]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const url = isSelf ? "/user/profile" : "/user/selected-user";

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + url,
        isSelf ? {} : { selectedUserId: userId },
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        },
      );

      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMedia = () => {
    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/message/get-all-msg",
        { withUserId: userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        },
      )
      .then((response) => {
        setMedia(response.data.data);
      })
      .catch((error) => {
        toast.error("Failed to load media. ");
      });
  };
  useEffect(() => {
    if (isSelf || userId) {
      fetchUserData();
      getMedia();
    }
  }, [userId, isSelf]);

  const dispatch = useDispatch();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        User not found or an error occurred.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl h-screen overflow-y-auto no-scrollbar">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-4xl bg-background text-primary">
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              {user.description && (
                <p className="text-primary-foreground/80 mt-2">
                  {user.description}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                <Badge variant="secondary" className="gap-1 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </Badge>
                {user.mobile && (
                  <Badge variant="secondary" className="gap-1 text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    {user.mobile}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      user.status === "online"
                        ? "bg-green-500"
                        : "bg-muted-foreground/50"
                    }`}
                  />
                  <span className="capitalize">{user.status || "offline"}</span>
                </div>
              </div>

              <div className="space-y-1 p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {user.lastSeen && (
                <div className="space-y-1 p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Seen
                  </p>
                  <p className="text-foreground">
                    {new Date(user.lastSeen).toLocaleString()}
                  </p>
                </div>
              )}

              {user.bio && (
                <div className="space-y-1 p-4 rounded-lg bg-muted/30 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    About
                  </p>
                  <p className="text-foreground whitespace-pre-line">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* media imgs */}
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {media.map(
            (img, i) =>
              img.image && (
                <div
                  key={i}
                  className="mb-4 break-inside-avoid rounded-2xl border border-gray-200 p-1"
                >
                  <img
                    onClick={() =>
                      dispatch(
                        openLightBox({
                          open: true,
                          image: {
                            src: img.image,
                            alt: img.image,
                            title: img.image,
                            description: img.image,
                            // description: img.image,
                          },
                          images: img.image,
                          index: i,
                        }),
                      )
                    }
                    src={img.image}
                    alt=""
                    className="w-full cursor-pointer rounded-sm border border-gray-200 dark:border-gray-700"
                  />
                </div>
              ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}
