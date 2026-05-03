import { User, Mail, Phone, MapPin, Save } from "lucide-react";

const inputClass =
  "w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-gray-800 placeholder-gray-400 transition-all duration-200";

const ProfileForm = ({ profile, onChange, onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-green-100/40 p-6 md:p-7">
      <h3 className="text-lg font-bold text-gray-800 mb-1">Personal Information</h3>
      <p className="text-sm text-gray-500 mb-5">Keep your profile details updated</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => onChange({ ...profile, name: e.target.value })}
                placeholder="John Doe"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) => onChange({ ...profile, email: e.target.value })}
                placeholder="user@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={profile.phoneNo || ""}
                onChange={(e) => onChange({ ...profile, phoneNo: e.target.value })}
                placeholder="(555) 123-4567"
                className={inputClass}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profile.address || ""}
                onChange={(e) => onChange({ ...profile, address: e.target.value })}
                placeholder="123 Main St, City"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;