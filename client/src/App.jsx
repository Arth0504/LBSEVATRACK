import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Temples from "./pages/Temples";
import TempleDetails from "./pages/TempleDetails";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import BookSlot from "./pages/BookSlot";
import Notes from "./components/Notes";
import AdminNotes from "./pages/AdminNotes";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import ManageTemples from "./pages/ManageTemples";
import ManageSlots from "./pages/ManageSlots";
import ManageUsers from "./pages/ManageUsers";
import CreateGate from "./pages/CreateGate";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminQueries from "./pages/AdminQueries";
import GateLayout from "./pages/GateLayout";
import GateVerify from "./pages/GateVerify";
import GateBookings from "./pages/GateBookings";
import GateActivity from "./pages/GateActivity";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/temples" element={<Temples />} />
        <Route path="/temple/:id" element={<TempleDetails />} />
        <Route path="/notes" element={<Notes />} />

        <Route path="/book/:slotId" element={<ProtectedRoute><BookSlot /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="temples" element={<ManageTemples />} />
          <Route path="slots" element={<ManageSlots />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="create-gate" element={<CreateGate />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="queries" element={<AdminQueries />} />
          <Route path="notes" element={<AdminNotes />} />
        </Route>

        <Route path="/gate" element={<ProtectedRoute role="gate"><GateLayout /></ProtectedRoute>}>
          <Route index element={<GateVerify />} />
          <Route path="bookings" element={<GateBookings />} />
          <Route path="activity" element={<GateActivity />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="!rounded-2xl !font-sans !text-sm !shadow-soft"
      />
    </Router>
  );
}

export default App;
