import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import '../Style/Navbar.css';

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const token = localStorage.getItem("token");
  let decodedToken;
  let username = "";

  if (token) {
    try {
      decodedToken = jwtDecode(token);
      username = decodedToken.username;
    } catch (error) {
      console.error("Token decoding error:", error);
    }
  }

  return (
    <div className="navbar">
      <div className="navbar-logo">Music Fan Zone</div>

      <div className="welcome-container">
        {isLoggedIn && username && (
          <h3 className="welcome-message-new">
            Welcome, {username}!
          </h3>
        )}
      </div>

      <nav>
        <ul className="navbar-list">
          <li><Link className="navbar-link" to="/">Home</Link></li>
          <li><Link className="navbar-link" to="/playlists">Playlists</Link></li>
          <li><Link className="navbar-link" to="/forum">Forum</Link></li>
          <li><Link className="navbar-link" to="/help">Info</Link></li> {/* Add Help link */}
          {!isLoggedIn ? (
            <>
              <li><Link className="navbar-link" to="/register">Register</Link></li>
              <li><Link className="navbar-link" to="/login">Login</Link></li>
            </>
          ) : (
            <div className="logout-container">
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
