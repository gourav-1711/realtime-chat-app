"use client";

import * as React from "react";
import {
  Search,
  Menu,
  MoreVertical,
  MessageSquare,
  Users,
  Phone,
  Video,
  Mail,
  X,
  User,
  Settings,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setChatWith } from "@/app/(redux)/features/chatWith";
import Link from "next/link";

export function AppSidebar() {
  const router = useRouter();

  const [apiUrl, setApiUrl] = React.useState(
    process.env.NEXT_PUBLIC_API_URL + "/message/get-conversation-with-other"
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [chats, setChats] = React.useState([]);

  const [open, setOpen] = React.useState(false);

  const handleApiUrl = () => {
    if (searchQuery) {
      setApiUrl(process.env.NEXT_PUBLIC_API_URL + "/user/find-users");
    } else {
      setApiUrl(
        process.env.NEXT_PUBLIC_API_URL + "/message/get-conversation-with-other"
      );
    }
  };

  React.useEffect(() => {
    handleApiUrl();

    axios
      .post(
        apiUrl,
        {
          search: searchQuery,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        }
      )
      .then((response) => {
        setChats(response.data.data);
      })
      .catch((error) => {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong"
        );
        console.log(error);
      });
  }, [searchQuery]);

  // Sample chat data
  // const chats = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     lastMessage: "Hey, how are you?",
  //     time: "10:30 AM",
  //     unread: 2,
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Smith",
  //     lastMessage: "Meeting at 3 PM",
  //     time: "9:15 AM",
  //     unread: 0,
  //   },
  //   {
  //     id: 3,
  //     name: "Team Group",
  //     lastMessage: "Alice: I'll send the files",
  //     time: "Yesterday",
  //     unread: 5,
  //   },
  // ];

  const handleOpen = () => {
    setOpen(!open);
  };

  const dispatch = useDispatch();

  const handleChatSelection = (id) => {
    router.push(`/dashboard/home`);
    dispatch(setChatWith(id));
  };

  return (
    <>
      <div onMouseEnter={() => setOpen(true)} className=" block md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div
        onMouseLeave={() => setOpen(false)}
        className={`fixed top-0 ${
          open ? "left-0 " : "left-[-100%]"
        } z-50 overflow-auto md:static bg-sidebar dark:bg-sidebar-dark  flex flex-col h-full duration-700 ease-in-out`}
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
            className="flex items-center font-bold"
          >
            BlinkChat
          </Link>
          <div className="flex items-center space-x-2">
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
            <form>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full pl-8 bg-gray-100 dark:bg-gray-700 border-0"
              />
            </form>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-[2px]">
          {chats.map((chat) => (
            <div
              onClick={() => handleChatSelection(chat._id)}
              key={chat._id}
              className="flex items-center p-3 bg-gray-200/50 rounded-2xl border-b border-gray-300/50 dark:border-gray-700 hover:bg-gray-300/50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage
                  src={chat.avatar ? chat.avatar : "/placeholder.svg"}
                />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col justify-between ">
                  <h3 className="font-medium truncate">{chat.name}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.description || "No description"}
                  </p>
                </div>
                {/* <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage}
              </p> */}
              </div>
              {/* {chat.unread > 0 && (
              <div className="ml-2 bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {chat.unread}
              </div>
            )} */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
