import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/userApi";

export const useUserProfile = () => {
  const [profile, setProfile] = useState({});
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // match what UserProfile.jsx is using
  const [loading, setLoading] = useState({
    fetch: true,
    profile: false,
    password: false,
    avatar: false,
  });

  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user");
      const user = res.data?.user || res.data || {};
      setProfile(user);
      setAvatarPreview(user.avatar || "");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      setLoading((prev) => ({ ...prev, profile: true }));

      const payload = {
        name: updatedData?.name ?? "",
        email: updatedData?.email ?? "",
        phoneNo: updatedData?.phoneNo ?? updatedData?.phone ?? "",
        address: updatedData?.address ?? "",
      };

      const res = await api.put("/user/update-profile", payload);
      const user = res.data?.user || {};

      setProfile(user);

      // sync header user
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existing, ...user }));
      window.dispatchEvent(new Event("user-updated"));

      toast.success(res.data?.message || "Profile updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    try {
      setLoading((prev) => ({ ...prev, password: true }));

      const payload = {
        currentPassword: passwordData?.oldPassword,
        newPassword: passwordData?.newPassword,
      };

      const res = await api.put("/user/update-password", payload);
      toast.success(res.data?.message || "Password updated");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading((prev) => ({ ...prev, avatar: true }));

      const res = await api.patch("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUrl = res.data?.avatarUrl || "";
      if (newUrl) setAvatarPreview(newUrl);

      toast.success("Avatar updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Avatar upload failed");
    } finally {
      setLoading((prev) => ({ ...prev, avatar: false }));
    }
  };

  return {
    profile,
    setProfile,
    passwords,
    setPasswords,
    loading,
    avatarPreview,
    handleProfileUpdate,
    handlePasswordUpdate,
    handleAvatarChange,
  };
};