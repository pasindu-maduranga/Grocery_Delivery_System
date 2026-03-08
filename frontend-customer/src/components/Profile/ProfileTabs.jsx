const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabClass = (tab) =>
    `flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
      activeTab === tab
        ? "bg-green-500 text-white shadow-md shadow-green-200"
        : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="flex gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-6">
      <button className={tabClass("profile")} onClick={() => onTabChange("profile")}>Edit Profile</button>
      <button className={tabClass("password")} onClick={() => onTabChange("password")}>Change Password</button>
    </div>
  );
};

export default ProfileTabs;