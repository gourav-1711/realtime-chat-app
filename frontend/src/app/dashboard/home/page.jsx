"use client";

import { useEffect, useState } from "react";
import {
  Paperclip,
  Mic,
  Smile,
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  Image as ImageIcon,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import ImageUploading from "react-images-uploading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { openLightBox } from "@/app/(redux)/features/lightBox";

export default function ChatPage() {
  const router = useRouter();
  //////////////////////////
  const [showPicker, setShowPicker] = useState(false);
  const selectedUserId = useSelector((state) => state.chatWith.chatWith);
  // Sample messages
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const socket = io(process.env.NEXT_PUBLIC_API, {
    transports: ["websocket", "polling"],
  });

  useEffect(() => {
    socket.on("connect", () => {
      // Add user to online users
      socket.emit("add-user", Cookies.get("chat-token"));
    });

    socket.on("user-status", ({ userId, status }) => {
      if (userId == selectedUserId) {
        setUser({ ...user, status });
      }
    });

    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("update-message", ({ messageId, isRead }) => {
      setMessages((prevMsgs) =>
        prevMsgs.map((msg) =>
          msg._id === messageId ? { ...msg, isRead } : msg
        )
      );
    });

    return () => {
      socket.off("connect");
      socket.off("user-status");
      socket.off("receive-message");
      socket.off("update-message");
    };
  }, [socket]);
  // Socket connection

  useEffect(() => {
    const lastIndex = messages.length - 1;
    const lastMsgObj = messages[lastIndex];
    if (!lastMsgObj || lastMsgObj.isRead) {
      return;
    }
    if (lastMsgObj.sender_id == selectedUserId) {
      axios.post(
        process.env.NEXT_PUBLIC_API_URL +
          "/message/mark-as-read/" +
          lastMsgObj._id,
        {},
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        }
      );
    }
  }, [messages]);

  /////////////////////////////////////
  const getUser = () => {
    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/user/selected-user",
        { selectedUserId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        }
      )
      .then((response) => {
        setUser(response.data.data);
      })
      .catch((error) => {
        setUser(null);
      });
  };

  const getMsg = () => {
    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/message/get-all-msg",
        { withUserId: selectedUserId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        }
      )
      .then((response) => {
        setMessages(response.data.data);
      })
      .catch((error) => {});
  };

  const setAsRead = () => {
    axios.post(
      process.env.NEXT_PUBLIC_API_URL +
        "/message/mark-all-as-read/" +
        selectedUserId,
      { withUserId: selectedUserId },
      {
        headers: {
          Authorization: "Bearer " + Cookies.get("chat-token"),
        },
      }
    );
  };

  useEffect(() => {
    getUser();
    getMsg();
    setAsRead();
  }, [selectedUserId]);

  useEffect(() => {
    const box = document.getElementById("msg-box");
    if (box && box.lastElementChild) {
      box.lastElementChild.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Sample chat data

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (selectedImage) {
      const formData = new FormData();
      formData.append("receiver_id", selectedUserId);
      formData.append("message", message || "");
      formData.append("image", selectedImage.file);

      axios
        .post(
          process.env.NEXT_PUBLIC_API_URL + "/message/send-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + Cookies.get("chat-token"),
            },
          }
        )
        .then((response) => {
          getMsg();
          setMessage("");
          setSelectedImage(null);
        })
        .catch((error) => {});
      return;
    }

    if (!message || message.trim() === "") {
      return; // Don't send empty messages
    }

    const formData = new FormData();
    formData.append("receiver_id", selectedUserId);

    if (message && message.trim() !== "") {
      formData.append("message", message);
    }

    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/message/send-message",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        }
      )
      .then((response) => {
        setMessage("");
      })
      .catch((error) => {});
  };

  const onChange = (imageList) => {
    if (imageList.length > 0) {
      setSelectedImage({
        file: imageList[0].file,
        preview: URL.createObjectURL(imageList[0].file),
      });
    } else {
      if (selectedImage?.preview) {
        URL.revokeObjectURL(selectedImage.preview);
      }
      setSelectedImage(null);
    }
  };
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <div
        onClick={() => router.push(`/dashboard/profile?view=contact`)}
        className="cursor-pointer flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className={"border border-gray-900"}>
              {user?.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{user?.name}</h2>
            <p
              className={`text-xs text-gray-500 ${
                user?.status === "online" ? "text-green-500" : "text-red-500"
              }`}
            >
              {user?.status === "online" ? "online" : "offline"}
            </p>
          </div>
        </div>
        <div className="">
          <ArrowRight className="size-5" />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-[#e5ddd5] dark:bg-gray-700 bg-opacity-30">
        <div id="msg-box" className="space-y-2">
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.sender_id !== selectedUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                    msg.sender_id !== selectedUserId
                      ? "bg-green-100 dark:bg-green-900 rounded-br-none"
                      : "bg-white dark:bg-gray-800 rounded-tl-none"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      onClick={() =>
                        dispatch(
                          openLightBox({
                            open: true,
                            image: {
                              src: msg.image,
                              alt: msg.image,
                              title: msg.image,
                              description: msg.image,
                            },
                            images: msg.image,
                            index: i,
                          })
                        )
                      }
                      alt="Message Image"
                      className="w-full h-auto rounded-lg cursor-pointer"
                    />
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-end gap-2 justify-end border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                    {msg.sender_id !== selectedUserId && (
                      <span>
                        {msg.isRead ? (
                          <div className="flex justify-end items-center">
                            {[1, 2].map((item) => (
                              <Check
                                key={item}
                                size={12}
                                className="h-3 w-3 text-green-500"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                        ) : (
                          <Check
                            size={12}
                            className="h-3 w-3 text-gray-500"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="w-full h-full flex justify-center items-center">
              No messages
            </p>
          )}
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {selectedImage && (
          <div className="relative mb-2 p-2 bg-white dark:bg-gray-700 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <div className="relative group">
                <div className="w-20 h-20 relative">
                  <Image
                    src={selectedImage.preview}
                    alt="uploaded"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(selectedImage.preview);
                    setSelectedImage(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <Button
            onClick={() => setShowPicker(!showPicker)}
            type="button"
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Smile className="h-5 w-5" />
            {showPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <div className="transform origin-bottom scale-75 sm:scale-90 md:scale-100">
                  <EmojiPicker
                    onEmojiClick={(emoji) => {
                      setMessage((prev) => prev + emoji.emoji);
                    }}
                  />
                </div>
              </div>
            )}
          </Button>

          <ImageUploading
            disabled={!!selectedImage}
            multiple={false}
            value={selectedImage ? [selectedImage] : []}
            onChange={onChange}
            maxNumber={1}
            dataURLKey="data_url"
            acceptType={["jpg", "jpeg", "png", "gif"]}
          >
            {({ onImageUpload, onImageRemove, dragProps }) => (
              <div className="flex items-center space-x-2">
                <Button
                  disabled={!!selectedImage}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                {/* {selectedImage && (
                  <div className="relative">
                    <Image
                      src={selectedImage.preview}
                      alt="Preview"
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(selectedImage.preview);
                        setSelectedImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )} */}
              </div>
            )}
          </ImageUploading>

          <Input
            type="text"
            placeholder="Type a message"
            className="flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
