import { useEffect, useState } from "react";
import API from "../api/axios";
import "./manageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const saveRole = async (id) => {
    await API.put(`/admin/users/${id}`, { role: editRole });
    setEditUserId(null);
    fetchUsers();
  };

  const toggleBlock = async (id) => {
    await API.put(`/admin/users/block/${id}`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await API.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const viewBookings = async (user) => {
    const res = await API.get(`/admin/user-bookings/${user._id}`);
    setUserBookings(res.data);
    setSelectedUser(user);
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    await API.put(`/admin/cancel-booking/${bookingId}`);

    // Refresh bookings
    const res = await API.get(
      `/admin/user-bookings/${selectedUser._id}`
    );
    setUserBookings(res.data);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">
      <h2>Manage Users</h2>

      <input
        type="text"
        placeholder="Search user..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>

              <td>
                {editUserId === user._id ? (
                  <>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="gate">Gate</option>
                    </select>
                    <button onClick={() => saveRole(user._id)}>
                      Save
                    </button>
                  </>
                ) : (
                  <span
                    className={`role-badge ${user.role}`}
                    onClick={() => {
                      setEditUserId(user._id);
                      setEditRole(user.role);
                    }}
                  >
                    {user.role}
                  </span>
                )}
              </td>

              <td>
                <span
                  className={`status-badge ${
                    user.isBlocked ? "blocked" : "active"
                  }`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </td>

              <td>
                <button
                  className="view-btn"
                  onClick={() => viewBookings(user)}
                >
                  View Bookings
                </button>

                <button
                  className="block-btn"
                  onClick={() => toggleBlock(user._id)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteUser(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BOOKINGS MODAL */}
      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedUser.name}'s Bookings</h3>

            {userBookings.length === 0 ? (
              <p>No bookings found</p>
            ) : (
              userBookings.map((b) => (
                <div key={b._id} className="booking-card">
                  <p><strong>ID:</strong> {b.bookingId}</p>
                  <p><strong>Temple:</strong> {b.slot?.temple?.name}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(b.slot?.date).toLocaleDateString()}
                  </p>
                  <p><strong>Members:</strong> {b.totalMembers}</p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status ${b.status}`}>
                      {b.status}
                    </span>
                  </p>

                  {b.status === "booked" && (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelBooking(b._id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))
            )}

            <button
              className="close-btn"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
