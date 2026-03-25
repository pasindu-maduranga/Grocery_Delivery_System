import { Camera } from "lucide-react";
import { useState } from "react";

const toAbsoluteAvatarUrl = (value) => {
  if (!value) return "";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }
  const base = import.meta.env.VITE_USER_SERVICE_ORIGIN || "http://localhost:5003";
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
};

const AvatarSection = ({ name, email, avatarPreview, loadingAvatar, onAvatarChange }) => {
  const [imgError, setImgError] = useState(false);
  const src = toAbsoluteAvatarUrl(avatarPreview);

  return (
    <div className="backdrop-blur-sm bg-white/80 rounded-3xl border border-white shadow-xl shadow-green-100/60 p-7 mb-6 text-center">
      <div className="relative inline-block mb-4">
        <div className="p-1 rounded-[22px] bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 shadow-lg shadow-green-300/40">
          <div className="w-24 h-24 rounded-[18px] bg-white flex items-center justify-center overflow-hidden">
            {src && !imgError ? (
              <img
                src={src}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-3xl font-extrabold bg-gradient-to-br from-green-500 to-emerald-700 bg-clip-text text-transparent">
                {name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>

        <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all">
          {loadingAvatar ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </label>
      </div>

      <h2 className="text-2xl font-black text-gray-800">{name || "User"}</h2>
      <p className="text-sm text-gray-500">{email || "No email"}</p>
    </div>
  );
};

export default AvatarSection;