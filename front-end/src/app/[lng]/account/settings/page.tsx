"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";
import toast from "react-hot-toast";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Shield,
  Moon,
  Globe,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import i18nConfig from "../../../../../i18nConfig";

export default function ProfileSettingsPage() {
  const { user, language, changeLanguage, setUser } = useBoundStore(
    (state) => state,
  );
  const [darkTheme, setDarkTheme] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmNewPassword = formData.get("confirmNewPassword") as string;
    console.log(currentPassword, newPassword, confirmNewPassword);

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { data } = await customAxios.put(`/auth/changepassword`, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setUser(data.data);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const [isRendered, setIsRendered] = useState(false);
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    console.log(i18n);
  }, [i18n.languages]);
  const handleChange = (newLocale) => {
    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // redirect to the new locale path
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push("/" + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`),
      );
    }

    router.refresh();
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);
  if (!isRendered) return null;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24">
          <Image
            src={user?.profile_image}
            alt="Profile"
            className="rounded-full object-cover"
            layout="fill"
          />
        </div>
        <h2 className="mt-4 text-xl font-semibold">{user?.username}</h2>
        <p className="text-gray-600">{user?.role}</p>
      </div>

      <div className="mx-auto mt-8">
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">User Information</h2>
          <div className="mb-4 flex items-center">
            <User className="mr-2 text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="font-bold text-gray-800">{user?.username}</p>
            </div>
          </div>
          <div className="mb-4 flex items-center">
            <Shield className="mr-2 text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <p className="font-bold text-gray-800">{user?.role}</p>
            </div>
          </div>
          <div className="mb-4 flex items-center">
            <Mail className="mr-2 text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="font-bold text-gray-800">{user?.email}</p>
            </div>
          </div>
          <div className="mb-4 flex items-center">
            <Phone className="mr-2 text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              {user?.phone_number == null ? (
                <p className="font-bold text-gray-800">
                  (You didn&apos;t put any phone number)
                </p>
              ) : (
                <p className="font-bold text-gray-800">{user?.phone_number}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Settings</h2>
          <div className="mb-4 flex items-center justify-between">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Moon className="mr-2 text-gray-500" />
              Dark Theme (Coming Soon)
            </label>
            <Switch
              checked={darkTheme}
              onChange={() => setDarkTheme(!darkTheme)}
              disabled
              className="cursor-not-allowed opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Globe className="mr-2 text-gray-500" />
              Language
            </label>
            <Select
              defaultValue={language}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="mt-1 block w-full focus-visible:ring-transparent" />
              <SelectContent>
                {i18nConfig.locales.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="mb-4">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <DollarSign className="mr-2 text-gray-500" />
              Currency
            </label>
            <Select
              value={currency}
              onValueChange={(value) => {
                changeCurrency(value);
              }}
            >
              <SelectTrigger className="mt-1 block w-full focus-visible:ring-transparent" />
              <SelectContent>
                {CURRENCY_LIST.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>
        {user?.provider == "credentials" && (
          <form
            onSubmit={handlePasswordChange}
            className="rounded-lg bg-white p-6 shadow-md"
          >
            <h2 className="mb-4 text-xl font-semibold">Change Password</h2>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <Input
                type="password"
                name="currentPassword"
                id="currentPassword"
                required
                className="mt-1 block w-full focus-visible:ring-transparent"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                id="newPassword"
                required
                className="mt-1 block w-full focus-visible:ring-transparent"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <Input
                type="password"
                name="confirmNewPassword"
                id="confirmNewPassword"
                required
                className="mt-1 block w-full focus-visible:ring-transparent"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white ring-0 focus:outline-none focus:ring-0"
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
