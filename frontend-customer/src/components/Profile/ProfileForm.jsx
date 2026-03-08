import { User, Mail, Phone, MapPin, Save } from "lucide-react";

const inputClass = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200";

const ProfileForm = ({ profile, onChange, onSubmit, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={profile.name} onChange={(e) => onChange({ ...profile, name: e.target.value })} placeholder="John Doe" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="email" value={profile.email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
        </div>
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="tel" value={profile.phoneNo} onChange={(e) => onChange({ ...profile, phoneNo: e.target.value })} placeholder="(555) 123-4567" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={profile.address} onChange={(e) => onChange({ ...profile, address: e.target.value })} placeholder="123 Main St, City" className={inputClass} />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2">
        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
      </button>
    </form>
  </div>
);

export default ProfileForm;