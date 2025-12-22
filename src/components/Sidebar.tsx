import React from "react";
import SidebarClient from "./SidebarClient";
import { getSidebarData } from "@/actions/sidebar";

export default async function Sidebar() {
  const result = await getSidebarData();
  const sections = result.success && result.data ? result.data : [];

  return <SidebarClient sections={sections} />;
}