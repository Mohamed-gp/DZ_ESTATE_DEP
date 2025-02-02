"use client";
import { useState, useEffect } from "react";
import customAxios from "@/utils/customAxios";
import { useRouter } from "next/navigation";
import useBoundStore from "@/store/store";
import { Button } from "@/components/ui/button";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminUsersPage = () => {
  const { user: currentUser } = useBoundStore((state) => state);

  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/"); // Redirect non-admin users to the home page
    } else {
      fetchUsers();
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      const { data } = await customAxios.get("/admin/users");
      setUsers(data.data);
      console.log(data.data)
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (userId === currentUser.id) {
      toast.error("You cannot remove yourself.");
      return;
    }
    if (userId == 23 || userId === 22) {
      toast.error("You cannot remove a demo user.");
      return;
      
    }
    try {
      await customAxios.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((user: any) => user.id !== userId));
      toast.success("User removed successfully");
    } catch (error) {
      toast.error("Failed to remove user");
    }
  };

  return (
    <div className="admin-users-page w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="user-card flex flex-col justify-between rounded border p-4 shadow"
                >
                  <div className="flex items-center">
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <p className="text-lg font-semibold">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Role: {user.role}</p>
                    <p className="text-sm text-gray-600">
                      Phone: {user.phone_number}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      disabled={currentUser.id === user.id}
                    >
                      <FaTrash className="mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
