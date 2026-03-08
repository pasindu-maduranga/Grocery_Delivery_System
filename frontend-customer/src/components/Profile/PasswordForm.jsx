import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const inputClass = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200";

const FIELDS = [
  { key: "current", label: "Current Password", field: "currentPassword" },
  { key: "new", label: "New Password", field: "newPassword" },
  { key: "confirm", label: "Confirm New Password", field: "confirmPassword" },
];

const PasswordForm = ({ passwords, onChange, onSubmit, loading }) => {
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, field }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPasswords[key] ? "text" : "password"}
                value={passwords[field]}
                onChange={(e) => onChange({ ...passwords, [field]: e.target.value })}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
              />
              <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock className="w-4 h-4" /> Update Password</>}
        </button>
      </form>
    </div>
  );
};

export default PasswordForm;