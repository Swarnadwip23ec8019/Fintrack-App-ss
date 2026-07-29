"use client";
import { Wallet, LayoutDashboard, ArrowRightLeft, BarChart3, Moon, LogOut, Sun } from "lucide-react";

export default function Sidebar({ user, activeView, setActiveView, toggleTheme, isLightMode, onLogout }) {
  return (
    <aside>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Wallet size={24} />
        </div>
        <h1>FinTrack</h1>
      </div>

      <p className="nav-label">Menu</p>

      <nav>
        <ul>
          <li>
            <button
              className={`nav-btn ${activeView === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveView("dashboard")}
            >
              <span className="nav-icon"><LayoutDashboard size={20} /></span>
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeView === "transactions" ? "active" : ""}`}
              onClick={() => setActiveView("transactions")}
            >
              <span className="nav-icon"><ArrowRightLeft size={20} /></span>
              Transactions
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeView === "analytics" ? "active" : ""}`}
              onClick={() => setActiveView("analytics")}
            >
              <span className="nav-icon"><BarChart3 size={20} /></span>
              Analytics
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-bottom-controls">
        <div className="theme-toggle-wrap">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span className="toggle-icon">{isLightMode ? <Sun size={20} /> : <Moon size={20} />}</span>
            <span className="toggle-text">{isLightMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        <div className="auth-control-wrap" style={{ marginTop: 10 }}>
          {user && (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", padding: "0 12px", wordBreak: "break-all" }}>
              Logged in as:<br/>
              <strong style={{ color: "var(--text-primary)" }}>{user.email}</strong>
            </div>
          )}
          <button className="theme-toggle-btn" style={{ color: "var(--danger-color)" }} onClick={onLogout}>
            <span className="toggle-icon"><LogOut size={20} /></span>
            <span className="toggle-text">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
