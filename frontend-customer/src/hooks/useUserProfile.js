import { useState, useEffect } from "react";
import { toast } from "sonner";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const apiUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const useUserProfile = () => {
  const [profile, setProfile] = useState({});
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState({ fetch: true, update: false, avatar: false });
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl("/user"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data.user || data);
      setAvatarPreview(data.user?.avatar || data.avatar || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      setLoading((prev) => ({ ...prev, update: true }));
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl("/user/update-profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data.user || data);
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    try {
      setLoading((prev) => ({ ...prev, update: true }));
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl("/user/update-password"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });
      if (!res.ok) throw new Error("Failed to update password");
      toast.success("Password updated");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password");
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading((prev) => ({ ...prev, avatar: true }));

      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl("/user/avatar"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Avatar upload failed");

      const data = await res.json();
      setAvatarPreview(data.avatarUrl?.startsWith("http") ? data.avatarUrl : apiUrl(data.avatarUrl));
      toast.success("Avatar updated");
    } catch (err) {
      console.error(err);
      toast.error("Avatar upload failed");
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