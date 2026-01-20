"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Smile,
  Send,
  Image as ImageIcon,
  X,
  Check,
  ArrowRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import ImageUploading from "react-images-uploading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import EmojiPicker from "emoji-picker-react";
import { useRouter } from "next/navigation";
import { openLightBox } from "@/app/(redux)/features/lightBox";
import { useSocket } from "@/components/socket-context";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef(null);

  const [showPicker, setShowPicker] = useState(false);
  const selectedUserId = useSelector((state) => state.chatWith.chatWith);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();
  const typingTimeoutRef = useRef(null);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = ({ userId, status }) => {
      if (userId === selectedUserId) {
        setUser((prev) => (prev ? { ...prev, status } : null));
      }
    };

    const handleReceiveMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const handleUpdateMessage = ({ messageId, isRead }) => {
      setMessages((prevMsgs) =>
        prevMsgs.map((msg) =>
          msg._id === messageId ? { ...msg, isRead } : msg,
        ),
      );
    };

    const handleTyping = ({ userId, typing }) => {
      if (userId === selectedUserId) {
        setIsTyping(typing);
      }
    };

    socket.on("user-status", handleUserStatus);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("update-message", handleUpdateMessage);
    socket.on("user-typing", handleTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("message-sent", handleMessageSent);
      socket.off("message-error", handleMessageError);
    };
  }, [socket, selectedUserId]);

  // Handle message sent confirmation
  const handleMessageSent = useCallback((sentMessage) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isPending && msg.message === sentMessage.message
          ? { ...sentMessage, isPending: false }
          : msg,
      ),
    );
  }, []);

  // Handle message send error
  const handleMessageError = useCallback((error) => {
    console.error("Message send error:", error);
    // You might want to show a toast here
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("message-sent", handleMessageSent);
    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("message-sent", handleMessageSent);
      socket.off("message-error", handleMessageError);
    };
  }, [socket, handleMessageSent, handleMessageError]);

  // Mark last message as read
  useEffect(() => {
    const lastIndex = messages.length - 1;
    const lastMsgObj = messages[lastIndex];
    if (!lastMsgObj || lastMsgObj.isRead) {
      return;
    }
    if (lastMsgObj.sender_id === selectedUserId) {
      // Use socket to mark as read
      if (socket) {
        socket.emit("mark-as-read", {
          messageId: lastMsgObj._id,
          senderId: lastMsgObj.sender_id,
        });
      }
    }
  }, [messages, selectedUserId, socket]);

  // Fetch user and messages
  const getUser = useCallback(() => {
    if (!selectedUserId) return;

    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/user/selected-user",
        { selectedUserId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        },
      )
      .then((response) => {
        setUser(response.data.data);
      })
      .catch((error) => {
        setUser(null);
      });
  }, [selectedUserId]);

  const getMsg = useCallback(() => {
    if (!selectedUserId) return;
    setLoading(true);

    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/message/get-all-msg",
        { withUserId: selectedUserId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("chat-token"),
          },
        },
      )
      .then((response) => {
        setMessages(response.data.data);
      })
      .catch((error) => {})
      .finally(() => {
        setLoading(false);
      });
  }, [selectedUserId]);

  const setAsRead = useCallback(() => {
    if (!selectedUserId) return;

    axios.post(
      process.env.NEXT_PUBLIC_API_URL +
        "/message/mark-all-as-read/" +
        selectedUserId,
      { withUserId: selectedUserId },
      {
        headers: {
          Authorization: "Bearer " + Cookies.get("chat-token"),
        },
      },
    );
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      getUser();
      getMsg();
      setAsRead();
    }
  }, [selectedUserId, getUser, getMsg, setAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator with debounce
  const handleTyping = useCallback(() => {
    if (socket && selectedUserId) {
      socket.emit("typing", { receiverId: selectedUserId, typing: true });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { receiverId: selectedUserId, typing: false });
      }, 2000);
    }
  }, [socket, selectedUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!message.trim() && !selectedImage) return;

    // Create optimistic message for instant display
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender_id: "self", // Will be compared as !== selectedUserId
      receiver_id: selectedUserId,
      message: message,
      image: selectedImage?.preview || null,
      createdAt: new Date().toISOString(),
      isRead: false,
      isPending: true,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    const currentMessage = message;
    const currentImage = selectedImage;
    setMessage("");
    setSending(true);

    try {
      if (currentImage) {
        const formData = new FormData();
        formData.append("receiver_id", selectedUserId);
        formData.append("message", currentMessage || "");
        formData.append("image", currentImage.file);

        await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/message/send-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + Cookies.get("chat-token"),
            },
          },
        );
        // Remove optimistic message and fetch real data
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        getMsg();
        setSelectedImage(null);
        return;
      }

      const formData = new FormData();
      formData.append("receiver_id", selectedUserId);
      formData.append("message", currentMessage);

      // Use socket for text messages
      if (socket) {
        socket.emit("send-message", {
          receiverId: selectedUserId,
          message: currentMessage,
          tempId: tempId,
        });
      }

      // We don't need to manually update state here as we did optimistic update
      // and will receive confirmation via 'message-sent' or 'receive-message'
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setMessage(currentMessage); // Restore message
    } finally {
      setSending(false);
    }
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

  // Message animation variants
  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Empty state when no user is selected
  if (!selectedUserId) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 p-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <MessageSquare className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Welcome to BlinkChat
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Select a conversation from the sidebar to start chatting, or search
            for someone new to connect with.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Chat header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => router.push(`/dashboard/profile?view=contact`)}
        className="cursor-pointer flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-11 w-11 ring-2 ring-green-500/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold">
                {user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user?.status === "online" && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.p
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-green-500 flex items-center gap-1"
                >
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: i * 0.1,
                        }}
                        className="w-1.5 h-1.5 bg-green-500 rounded-full"
                      />
                    ))}
                  </span>
                  typing...
                </motion.p>
              ) : (
                <motion.p
                  key="status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs ${
                    user?.status === "online"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {user?.status === "online" ? "Online" : "Offline"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <motion.div
                    key={msg._id}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className={`flex ${
                      msg.sender_id !== selectedUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.sender_id !== selectedUserId
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-md"
                      }`}
                    >
                      {msg.image && (
                        <motion.img
                          whileHover={{ scale: 1.02 }}
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
                              }),
                            )
                          }
                          alt="Message Image"
                          className="max-w-[200px] max-h-[200px] w-auto h-auto rounded-xl cursor-pointer mb-2 object-cover"
                        />
                      )}
                      {msg.message && (
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      )}
                      <div
                        className={`flex items-center gap-1.5 justify-end mt-1 ${
                          msg.sender_id !== selectedUserId
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-[10px]">
                          {formatTime(msg.createdAt)}
                        </span>
                        {msg.sender_id !== selectedUserId && (
                          <span className="flex">
                            {msg.isRead ? (
                              <span className="flex -space-x-1">
                                <Check className="h-3 w-3 text-blue-300" />
                                <Check className="h-3 w-3 text-blue-300" />
                              </span>
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[50vh] text-gray-400"
                >
                  <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">
                    Send a message to start the conversation
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50"
      >
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="relative inline-block">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden ring-2 ring-green-500">
                  <Image
                    src={selectedImage.preview}
                    alt="uploaded"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(selectedImage.preview);
                    setSelectedImage(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow-lg transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <div className="relative">
            <Button
              onClick={() => setShowPicker(!showPicker)}
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={(emoji) => {
                      setMessage((prev) => prev + emoji.emoji);
                    }}
                    theme="auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ImageUploading
            disabled={!!selectedImage}
            multiple={false}
            value={selectedImage ? [selectedImage] : []}
            onChange={onChange}
            maxNumber={1}
            dataURLKey="data_url"
            acceptType={["jpg", "jpeg", "png", "gif"]}
          >
            {({ onImageUpload, dragProps }) => (
              <Button
                disabled={!!selectedImage}
                type="button"
                variant="ghost"
                size="icon"
                onClick={onImageUpload}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                {...dragProps}
              >
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </ImageUploading>

          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              className="w-full rounded-full bg-gray-100 dark:bg-gray-700 border-0 pr-4 pl-4 py-6 focus-visible:ring-green-500"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
            />
          </div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              size="icon"
              disabled={sending || (!message.trim() && !selectedImage)}
              className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30 h-12 w-12"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
