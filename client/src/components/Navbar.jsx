import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <span>Seva</span>Track
      </div>

      <div className="nav-links">
        <Link className={location.pathname === "/" ? "active" : ""} to="/">
          Home
        </Link>

        {(!user || user.role === "user") && (
          <Link
            className={location.pathname === "/temples" ? "active" : ""}
            to="/temples"
          >
            Temples
          </Link>
        )}

        {user?.role === "user" && (
          <Link
            className={location.pathname === "/my-bookings" ? "active" : ""}
            to="/my-bookings"
          >
            My Bookings
          </Link>
        )}

        {user?.role === "admin" && (
          <Link
            className={location.pathname === "/admin" ? "active" : ""}
            to="/admin"
          >
            Admin Dashboard
          </Link>
        )}

        {user?.role === "gate" && (
          <Link
            className={location.pathname === "/gate" ? "active" : ""}
            to="/gate"
          >
            Gate Panel
          </Link>
        )}

        {!token ? (
          <>
            <Link to="/login" className="btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
