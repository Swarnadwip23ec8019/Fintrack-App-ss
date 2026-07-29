"use client";
import { Moon, LogOut, Sun } from "lucide-react";

export default function Sidebar({ user, activeView, setActiveView, toggleTheme, isLightMode, onLogout }) {
  return (
    <aside>
      <div className="sidebar-logo">
        <h1 style={{ margin: 0, padding: "10px 0", fontSize: "24px", letterSpacing: "-0.5px" }}>FinTrack</h1>
      </div>

      <p className="nav-label">Menu</p>

      <nav>
        <ul>
          <li>
            <button
              className={`nav-btn ${activeView === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveView("dashboard")}
              style={{ paddingLeft: "16px" }}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeView === "transactions" ? "active" : ""}`}
              onClick={() => setActiveView("transactions")}
              style={{ paddingLeft: "16px" }}
            >
              Transactions
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeView === "analytics" ? "active" : ""}`}
              onClick={() => setActiveView("analytics")}
              style={{ paddingLeft: "16px" }}
            >
              Analytics
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-bottom-controls">
        <div className="theme-toggle-wrap">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span className="toggle-icon" style={{ display: "flex", alignItems: "center", marginRight: 8 }}>{isLightMode ? <Sun size={20} /> : <Moon size={20} />}</span>
            <span className="toggle-text" style={{ padding: 0 }}>{isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}</span>
          </button>
        </div>

        <div className="auth-control-wrap" style={{ marginTop: 20 }}>
          {user && (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", padding: "0 16px", wordBreak: "break-all" }}>
              Logged in as:<br/>
              <strong style={{ color: "var(--text-primary)" }}>{user.email}</strong>
            </div>
          )}
          <button className="theme-toggle-btn" style={{ color: "var(--danger-color)" }} onClick={onLogout}>
            <span className="toggle-icon" style={{ display: "flex", alignItems: "center", marginRight: 8 }}><LogOut size={20} /></span>
            <span className="toggle-text" style={{ padding: 0 }}>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
