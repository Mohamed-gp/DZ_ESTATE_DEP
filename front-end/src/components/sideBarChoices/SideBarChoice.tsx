"use client"
import useBoundStore from "@/store/store";
import AdminSideBar from "../accountSideBar/AdminSideBar";
import SideBar from "../accountSideBar/AccountSideBar";

const SideBarChoice = () => {
  const { user } = useBoundStore();

  return <>{user?.role === "admin" ? <AdminSideBar /> : <SideBar />}</>;
};
export default SideBarChoice;
