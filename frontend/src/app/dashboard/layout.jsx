import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export const metadata = {
  title: "BlinkChat",
  description: "A chat app built with Next.js and Tailwind CSS",
};


export default function Layout({ children }) {



  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarProvider>
       
          <AppSidebar/>

        <div className="flex-1 flex flex-col">{children}</div>
      </SidebarProvider>
    </div>
  );
}
