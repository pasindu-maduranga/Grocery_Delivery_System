import { Camera } from "lucide-react";

const AvatarSection = ({ name, email, avatarPreview, loadingAvatar, onAvatarChange }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-center">
    <div className="relative inline-block mb-4">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200 overflow-hidden">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-3xl font-bold">{name?.charAt(0)?.toUpperCase() || "U"}</span>
        )}
      </div>
      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-all">
        {loadingAvatar ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="w-4 h-4 text-white" />
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
      </label>
    </div>
    <h2 className="text-xl font-bold text-gray-800">{name}</h2>
    <p className="text-sm text-gray-400">{email}</p>
  </div>
);

export default AvatarSection;