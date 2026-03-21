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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-400">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
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
