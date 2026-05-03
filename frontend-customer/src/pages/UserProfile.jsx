import { useState } from "react";
import Navbar from "../components/Navbar";
import AvatarSection from "../components/Profile/AvatarSecton";
import ProfileTabs from "../components/Profile/ProfileTabs";
import ProfileForm from "../components/Profile/ProfileForm";
import PasswordForm from "../components/Profile/PasswordForm";
import { useUserProfile } from "../hooks/useUserProfile";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const {
    profile,
    setProfile,
    passwords,
    setPasswords,
    loading,
    avatarPreview,
    handleProfileUpdate,
    handlePasswordUpdate,
    handleAvatarChange,
  } = useUserProfile();

  if (loading.fetch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center text-gray-500">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-emerald-50">
      <Navbar />

      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-green-200/40 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-40 -right-24 w-80 h-80 bg-emerald-200/40 blur-3xl rounded-full" />

      <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account details and security settings</p>
        </div>

        <AvatarSection
          name={profile.name}
          email={profile.email}
          avatarPreview={avatarPreview}
          loadingAvatar={loading.avatar}
          onAvatarChange={handleAvatarChange}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "profile" && (
          <ProfileForm
            profile={profile}
            onChange={setProfile}
            onSubmit={handleProfileUpdate}
            loading={loading.profile}
          />
        )}

        {activeTab === "password" && (
          <PasswordForm
            passwords={passwords}
            onChange={setPasswords}
            onSubmit={handlePasswordUpdate}
            loading={loading.password}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
