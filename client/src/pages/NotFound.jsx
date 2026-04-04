import { useNavigate } from "react-router-dom";
import "../styles/notfound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="error-code">404</h1>
      <h2>Page Not Found</h2>
      <p>
        The page you are looking for does not exist or has been moved.
      </p>

      <button onClick={() => navigate("/")} className="home-btn">
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
