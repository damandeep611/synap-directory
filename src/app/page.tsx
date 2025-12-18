"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";

export default function Home() {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 h-full relative">
        <MainContent activeTab={activeTab} />
      </main>
    </div>
  );
}
