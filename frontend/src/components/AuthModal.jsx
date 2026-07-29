"use client";
import { useState } from "react";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { sendEmailOTP, generateOTP } from "../lib/email";

export default function AuthModal({ onLogin }) {
  const [view, setView] = useState("main"); // main, otp, forgot-email, forgot-reset
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [currentOTP, setCurrentOTP] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoginTab) {
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      } catch (err) {
        alert(err.message);
      }
      setIsLoading(false);
    } else {
      // Register Validations
      if (password !== confirmPassword) {
        alert("password is not same");
        return;
      }
      if (password.length < 6) {
        alert("password must be of at least 6 characters");
        return;
      }
      
      setIsLoading(true);
      try {
        // Check if email already in use
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          alert("email already in use");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Ignore operation-not-allowed if email enumeration is disabled
        if (error.code !== 'auth/operation-not-allowed') {
           console.warn("Could not pre-check email existence:", error);
        }
      }

      // Generate and Send OTP
      const otp = generateOTP();
      setCurrentOTP(otp);
      
      const success = await sendEmailOTP(email, otp);
      if (success) {
        setView("otp");
      } else {
        alert("Failed to send OTP to your email.");
      }
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpInput !== currentOTP) {
      alert("Invalid OTP! Try again.");
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onLogin(); // Authentication listener in page.js will also catch this
    } catch (err) {
      alert(err.message);
    }
    setIsLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("A password reset link has been securely sent to your email!");
      setView("main");
      setIsLoginTab(true);
    } catch (err) {
      alert(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div id="auth-modal" className="modal-overlay active" style={{ display: "flex", opacity: 1, pointerEvents: "auto", background: "rgba(0, 0, 0, 0.95)", zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: 400, width: "100%" }}>
        
        {/* VIEW 1: LOGIN / REGISTER */}
        {view === "main" && (
          <div id="auth-view-main">
            <div className="modal-header" style={{ justifyContent: "center", borderBottom: "none", marginBottom: 10 }}>
              <h2 style={{ fontSize: 24 }}>Welcome to FinTrack</h2>
            </div>

            <div className="auth-tabs" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button 
                type="button"
                className="submit-btn" 
                style={{ flex: 1, background: isLoginTab ? "var(--accent-blue)" : "var(--bg-hover)", color: isLoginTab ? "#fff" : "var(--text)" }}
                onClick={() => setIsLoginTab(true)}
              >
                Login
              </button>
              <button 
                type="button"
                className="submit-btn" 
                style={{ flex: 1, background: !isLoginTab ? "var(--accent-blue)" : "var(--bg-hover)", color: !isLoginTab ? "#fff" : "var(--text)" }}
                onClick={() => setIsLoginTab(false)}
              >
                Register
              </button>
            </div>

            <form id="auth-form" noValidate onSubmit={handleMainSubmit}>
              <div className="form-group" style={{ marginBottom: 15 }}>
                <label htmlFor="auth-email">Email Address</label>
                <input 
                  type="email" 
                  id="auth-email" 
                  required 
                  autoComplete="email" 
                  style={{ width: "100%" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 15 }}>
                <label htmlFor="auth-password">Password</label>
                <input 
                  type="password" 
                  id="auth-password" 
                  required 
                  minLength="6" 
                  autoComplete="current-password" 
                  style={{ width: "100%" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isLoginTab && (
                <div className="form-group" id="auth-confirm-group" style={{ marginBottom: 15 }}>
                  <label htmlFor="auth-confirm-password">Confirm Password</label>
                  <input 
                    type="password" 
                    id="auth-confirm-password" 
                    autoComplete="new-password" 
                    style={{ width: "100%" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {isLoginTab && (
                <div id="auth-forgot-wrap" style={{ textAlign: "right", marginBottom: 25 }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setView("forgot-email"); }} style={{ color: "var(--accent-blue)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                    Forgot Password?
                  </a>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: "100%", fontSize: 16 }}>
                {isLoading ? "Processing..." : (isLoginTab ? "Login" : "Register")}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: OTP VERIFICATION */}
        {view === "otp" && (
          <div id="auth-view-otp" style={{ textAlign: "center" }}>
            <div className="modal-header" style={{ justifyContent: "center", borderBottom: "none", marginBottom: 5 }}>
              <h2 style={{ fontSize: 24 }}>Verify Email</h2>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
              We sent a 6-digit code to <br/><b style={{ color: "var(--text-primary)" }}>{email}</b>
            </p>

            <form noValidate onSubmit={handleOtpSubmit}>
              <div className="form-group" style={{ marginBottom: 25 }}>
                <input 
                  type="text" 
                  placeholder="000000" 
                  maxLength="6" 
                  required 
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{ width: "100%", textAlign: "center", fontSize: 24, letterSpacing: "0.5em", padding: 15 }} 
                />
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: "100%", fontSize: 16, marginBottom: 15 }}>
                {isLoading ? "Creating Account..." : "Verify OTP"}
              </button>
              <a href="#" onClick={(e) => { e.preventDefault(); setView("main"); }} style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
                &larr; Back
              </a>
            </form>
          </div>
        )}

        {/* VIEW 3: FORGOT PASSWORD (EMAIL) */}
        {view === "forgot-email" && (
          <div id="auth-view-forgot-email">
            <div className="modal-header" style={{ justifyContent: "center", borderBottom: "none", marginBottom: 5 }}>
              <h2 style={{ fontSize: 24 }}>Reset Password</h2>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 15, textAlign: "center" }}>
              Enter your email to receive a secure password reset link.
            </p>
            
            <form noValidate onSubmit={handleForgotSubmit}>
              <div className="form-group" style={{ marginBottom: 25 }}>
                <label>Email Address</label>
                <input type="email" required style={{ width: "100%" }} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: "100%", fontSize: 16, marginBottom: 15 }}>
                {isLoading ? "Sending Link..." : "Send Reset Mail"}
              </button>
              <div style={{ textAlign: "center" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView("main"); }} style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
                  &larr; Back to Login
                </a>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
