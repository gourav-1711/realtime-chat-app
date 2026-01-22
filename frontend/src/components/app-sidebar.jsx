"use client";

import * as React from "react";
import {
  Search,
  Menu,
  MessageSquare,
  Users,
  X,
  User,
  Settings,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setChatWith } from "@/app/(redux)/features/chatWith";
import Link from "next/link";

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function AppSidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [chats, setChats] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch chats based on search query
  React.useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError("");

      try {
        const apiUrl = debouncedSearchQuery
          ? process.env.NEXT_PUBLIC_API_URL + "/user/find-users"
          : process.env.NEXT_PUBLIC_API_URL +
            "/message/get-conversation-with-other";

        const response = await axios.post(
          apiUrl,
          { search: debouncedSearchQuery },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + Cookies.get("chat-token"),
            },
          },
        );

        setChats(response.data.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [debouncedSearchQuery]);

  const handleOpen = () => {
    setOpen(!open);
  };

  const dispatch = useDispatch();

  const handleChatSelection = (id) => {
    router.push(`/dashboard/home`);
    dispatch(setChatWith(id));
    setOpen(false); // Close sidebar on mobile after selection
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <>
      <div onMouseEnter={() => setOpen(true)} className="block md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div
        onMouseLeave={() => setOpen(false)}
        className={`fixed top-0 ${
          open ? "left-0" : "left-[-100%]"
        } z-50 overflow-auto md:static bg-sidebar dark:bg-sidebar-dark flex flex-col h-full duration-700 ease-in-out w-80`}
      >
        <Button
          className={"flex justify-end w-full px-4 md:hidden"}
          variant="ghost"
          size="icon"
          onClick={handleOpen}
        >
          <X className="h-5 w-5" />
        </Button>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Link
            href={"/dashboard/home"}
            className="flex items-center gap-2 font-bold text-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            BlinkChat
          </Link>
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => router.push("/dashboard/profile?view=self")}
              variant="ghost"
              size="icon"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/dashboard/settings")}
              variant="ghost"
              size="icon"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/dashboard/settings?logout=true")}
              variant="ghost"
              size="icon"
            >
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full pl-9 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4 text-sm">{error}</div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Users className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No users found" : "No conversations yet"}
              </p>
              <p className="text-xs text-gray-400">
                {searchQuery
                  ? "Try a different search"
                  : "Search for users to start chatting"}
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                onClick={() => handleChatSelection(chat._id)}
                key={chat._id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage
                      src={chat.avatar ? chat.avatar : "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                      {chat.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {chat.status === "online" && (
                    <span className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTimeAgo(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage || chat.description || "No messages yet"}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="ml-2 bg-green-500 text-white rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-medium">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
