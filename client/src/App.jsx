import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Temples from "./pages/Temples";
import TempleDetails from "./pages/TempleDetails";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import BookSlot from "./pages/BookSlot";

/* 🔥 USER NOTE */
import Notes from "./components/Notes";

/* 🔥 ADMIN NOTE */
import AdminNotes from "./pages/AdminNotes";

/* ================= ADMIN ================= */
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import ManageTemples from "./pages/ManageTemples";
import ManageSlots from "./pages/ManageSlots";
import ManageUsers from "./pages/ManageUsers";
import CreateGate from "./pages/CreateGate";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminQueries from "./pages/AdminQueries";

/* ================= GATE ================= */
import GateLayout from "./pages/GateLayout";
import GateVerify from "./pages/GateVerify";
import GateBookings from "./pages/GateBookings";
import GateActivity from "./pages/GateActivity";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/temples" element={<Temples />} />
        <Route path="/temple/:id" element={<TempleDetails />} />

        {/* 🔥 USER NOTICE BOARD */}
        <Route path="/notes" element={<Notes />} />

        {/* ================= USER ROUTES ================= */}
        <Route
          path="/book/:slotId"
          element={
            <ProtectedRoute>
              <BookSlot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="temples" element={<ManageTemples />} />
          <Route path="slots" element={<ManageSlots />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="create-gate" element={<CreateGate />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="queries" element={<AdminQueries />} />

          {/* 🔥 ADMIN NOTICE BOARD */}
          <Route path="notes" element={<AdminNotes />} />
        </Route>

        {/* ================= GATE ROUTES ================= */}
        <Route
          path="/gate"
          element={
            <ProtectedRoute role="gate">
              <GateLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GateVerify />} />
          <Route path="bookings" element={<GateBookings />} />
          <Route path="activity" element={<GateActivity />} />
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;