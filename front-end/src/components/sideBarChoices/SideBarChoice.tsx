"use client";
import useBoundStore from "@/store/store";
import AdminSideBar from "../accountSideBar/AdminSideBar";
import SideBar from "../accountSideBar/AccountSideBar";
import { useEffect, useState } from "react";

const SideBarChoice = () => {
  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  const { user } = useBoundStore();
  if (!render) return null;

  return <>{user?.role === "admin" ? <AdminSideBar /> : <SideBar />}</>;
};
export default SideBarChoice;
