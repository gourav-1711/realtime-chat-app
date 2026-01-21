import React from 'react'
import { motion } from "framer-motion";
export default function EmptyChatBox() {
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
  )
}
