"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import Transactions from "../components/Transactions";
import Analytics from "../components/Analytics";
import Savings from "../components/Savings";
import AuthModal from "../components/AuthModal";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fetchTransactions } from "../lib/db";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [isLightMode, setIsLightMode] = useState(false);

  // Example state for UI
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Load theme preference
    const storedTheme = localStorage.getItem("fintrack-theme");
    if (storedTheme === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLightMode(true);
      document.body.classList.add("light-theme");
    }
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Fetch user's private data from Firestore
        const userTxs = await fetchTransactions(user.uid);
        setTransactions(userTxs);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setTransactions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.classList.toggle("light-theme");
    localStorage.setItem("fintrack-theme", !isLightMode ? "light" : "dark");
  };

  return (
    <>
      <Sidebar 
        user={currentUser}
        activeView={activeView} 
        setActiveView={setActiveView} 
        toggleTheme={toggleTheme} 
        isLightMode={isLightMode} 
        onLogout={handleLogout}
      />
      <main className="main-content">

        {/* View Switcher */}
        {activeView === "dashboard" && <Dashboard user={currentUser} transactions={transactions} setActiveView={setActiveView} />}
        {activeView === "transactions" && <Transactions user={currentUser} transactions={transactions} setTransactions={setTransactions} />}
        {activeView === "analytics" && <Analytics transactions={transactions} />}
        {activeView === "savings" && <Savings user={currentUser} />}
      </main>
      
      {!isAuthenticated && <AuthModal onLogin={() => setIsAuthenticated(true)} />}
    </>
  );
}
