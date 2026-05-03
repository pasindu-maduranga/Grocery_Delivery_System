import { UserCog, KeyRound } from "lucide-react";

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabClass = (tab) =>
    `flex-1 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
      activeTab === tab
        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-200"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-2 mb-6">
      <div className="flex gap-2">
        <button className={tabClass("profile")} onClick={() => onTabChange("profile")}>
          <UserCog className="w-4 h-4" /> Edit Profile
        </button>
        <button className={tabClass("password")} onClick={() => onTabChange("password")}>
          <KeyRound className="w-4 h-4" /> Change Password
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;