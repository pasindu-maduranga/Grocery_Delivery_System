import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/userApi";

export const useUserProfile = () => {
  const [profile, setProfile] = useState({ name: "", email: "", phoneNo: "", address: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState({ profile: false, password: false, avatar: false, fetch: true });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user");
        const u = res.data.user;
        setProfile({ name: u.name || "", email: u.email || "", phoneNo: u.phoneNo || "", address: u.address || "" });
        setAvatarPreview(u.avatar || null);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const res = await api.put("/user/update-profile", {
        name: profile.name, phoneNo: profile.phoneNo, address: profile.address,
      });
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: profile.name }));
      toast.success(res.data.message || "Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("New passwords do not match");
    if (passwords.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading((prev) => ({ ...prev, password: true }));
    try {
      const res = await api.put("/user/update-password", {
        currentPassword: passwords.currentPassword, newPassword: passwords.newPassword,
      });
      toast.success(res.data.message || "Password updated!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setLoading((prev) => ({ ...prev, avatar: true }));
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.post("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Avatar updated!");
      setAvatarPreview(res.data.avatarUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || "Avatar upload failed");
    } finally {
      setLoading((prev) => ({ ...prev, avatar: false }));
    }
  };

  return {
    profile, setProfile,
    passwords, setPasswords,
    loading, avatarPreview,
    handleProfileUpdate,
    handlePasswordUpdate,
    handleAvatarChange,
  };
};