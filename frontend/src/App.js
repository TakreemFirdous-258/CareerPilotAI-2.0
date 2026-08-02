import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import { Login, Register } from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Resume from "@/pages/Resume";
import Career from "@/pages/Career";
import Interview from "@/pages/Interview";
import Skills from "@/pages/Skills";
import Jobs from "@/pages/Jobs";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";

function ProtectedShell() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<ProtectedShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="resume" element={<Resume />} />
            <Route path="career" element={<Career />} />
            <Route path="interview" element={<Interview />} />
            <Route path="skills" element={<Skills />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="progress" element={<Progress />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
