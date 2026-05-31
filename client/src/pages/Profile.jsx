import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { User, Mail, Phone, Lock, Save, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ACCENT = "#dd2d4a";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/me");
      setUser(res.data);
      setForm({ name: res.data.name || "", mobile: res.data.mobile || "", password: "" });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { name: form.name, mobile: form.mobile };
      if (form.password) payload.password = form.password;
      
      const res = await API.put("/auth/profile", payload);
      toast.success("Profile updated successfully ✓");
      setUser(res.data.user);
      setForm(prev => ({ ...prev, password: "" }));
      
      // Update local storage if needed
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data.user }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      toast.info("Uploading photo...");
      const res = await API.post("/auth/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Photo updated ✓");
      setUser(prev => ({ ...prev, profilePhoto: res.data.profilePhoto }));
      
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, profilePhoto: res.data.profilePhoto }));
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your account settings</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Go Back
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-serif text-4xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer text-gray-500 hover:text-red-500 hover:scale-105 transition-all">
                <Camera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-serif text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 uppercase tracking-wider">
                Role: {user?.role}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Phone size={14} /> Mobile Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                  value={form.mobile}
                  onChange={e => setForm({...form, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Lock size={14} /> New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Leave blank to keep current"
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#dd2d4a] to-[#e64a63] hover:from-[#c21e38] hover:to-[#dd2d4a] text-white rounded-xl font-medium shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
