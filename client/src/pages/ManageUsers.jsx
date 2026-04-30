import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Search, Eye, ShieldOff, Shield, Trash2, X, Calendar, Hash, Users } from "lucide-react";

const ACCENT = "#dd2d4a";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const saveRole = async (id) => {
    try {
      await API.put(`/admin/users/${id}`, { role: editRole });
      setEditUserId(null);
      toast.success("Role updated ✓");
      fetchUsers();
    } catch { toast.error("Role update failed"); }
  };

  const toggleBlock = async (id) => {
    try {
      await API.put(`/admin/users/block/${id}`);
      toast.success("User status updated ✓");
      fetchUsers();
    } catch { toast.error("Action failed"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch { toast.error("Delete failed"); }
  };

  const viewBookings = async (user) => {
    setSelectedUser(user);
    setBookingsLoading(true);
    try {
      const res = await API.get(`/admin/user-bookings/${user._id}`);
      setUserBookings(res.data);
    } catch { toast.error("Failed to load bookings"); }
    finally { setBookingsLoading(false); }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await API.put(`/admin/cancel-booking/${bookingId}`);
      toast.success("Booking cancelled");
      const res = await API.get(`/admin/user-bookings/${selectedUser._id}`);
      setUserBookings(res.data);
    } catch { toast.error("Cancel failed"); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = { admin: "bg-purple-50 text-purple-700 border-purple-200", gate: "bg-blue-50 text-blue-700 border-blue-200", user: "bg-gray-100 text-gray-600 border-gray-200" };
    return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[role] || map.user}`;
  };

  const statusCls = s => s === "booked" ? "status-booked" : s === "used" ? "status-used" : "status-cancelled";

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-sub">{users.length} registered users</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-10"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["User", "Email", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="table-head-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-300 text-sm">No users found</td></tr>
              ) : filtered.map(user => (
                <tr key={user._id} className="hover:bg-gray-25 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                           style={{ background: "#fff0f2", border: "1px solid #ffadb8", color: ACCENT }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{user.email}</td>
                  <td className="table-cell">
                    {editUserId === user._id ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="input py-1.5 text-xs w-24"
                          value={editRole}
                          onChange={e => setEditRole(e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="gate">Gate</option>
                        </select>
                        <button onClick={() => saveRole(user._id)} className="btn-primary py-1.5 px-3 text-xs">Save</button>
                        <button onClick={() => setEditUserId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={13} /></button>
                      </div>
                    ) : (
                      <span className={`${roleBadge(user.role)} cursor-pointer`} onClick={() => { setEditUserId(user._id); setEditRole(user.role); }}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${user.isBlocked ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => viewBookings(user)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="View Bookings">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => toggleBlock(user._id)} className={`p-1.5 rounded-lg transition-colors ${user.isBlocked ? "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600" : "text-gray-400 hover:bg-amber-50 hover:text-amber-600"}`} title={user.isBlocked ? "Unblock" : "Block"}>
                        {user.isBlocked ? <Shield size={14} /> : <ShieldOff size={14} />}
                      </button>
                      <button onClick={() => deleteUser(user._id)} className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: "#fff0f2" }}>
              <div className="flex items-center gap-3">
                <Users size={18} style={{ color: ACCENT }} />
                <h3 className="font-serif text-lg font-bold text-gray-800">{selectedUser.name}'s Bookings</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl text-gray-400 hover:bg-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6">
              {bookingsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-7 h-7 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: ACCENT }} />
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar size={36} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400">No bookings found for this user</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userBookings.map(b => (
                    <div key={b._id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{b.slot?.temple?.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(b.slot?.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span className="flex items-center gap-1"><Hash size={11} /> {b.bookingId}</span>
                          </div>
                        </div>
                        <span className={statusCls(b.status)}>{b.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{b.totalMembers} member{b.totalMembers > 1 ? "s" : ""}</span>
                        {b.status === "booked" && (
                          <button onClick={() => cancelBooking(b._id)} className="btn-danger py-1.5 px-3 text-xs">Cancel</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
