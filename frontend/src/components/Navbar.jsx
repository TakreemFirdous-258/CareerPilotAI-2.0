import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Compass, LogOut, LayoutDashboard, FileText, Target, MessageSquare, GraduationCap, Briefcase, LineChart, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
  { to: "/app/resume", label: "Resume", icon: FileText, testId: "nav-resume" },
  { to: "/app/career", label: "Career", icon: Target, testId: "nav-career" },
  { to: "/app/interview", label: "Interview", icon: MessageSquare, testId: "nav-interview" },
  { to: "/app/skills", label: "Skill Gap", icon: GraduationCap, testId: "nav-skills" },
  { to: "/app/jobs", label: "Jobs", icon: Briefcase, testId: "nav-jobs" },
  { to: "/app/progress", label: "Progress", icon: LineChart, testId: "nav-progress" },
  { to: "/app/profile", label: "Profile", icon: UserCircle, testId: "nav-profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col glass border-r border-white/10 z-40">
      <div className="p-6 border-b border-white/10">
        <Link to="/app/dashboard" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center emerald-glow">
            <Compass className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">CareerPilot</div>
            <div className="text-xs text-emerald-400">AI Guidance</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(l => {
          const active = loc.pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              data-testid={l.testId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                active
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="glass rounded-lg p-3 mb-3">
          <div className="text-xs text-slate-400">Signed in as</div>
          <div className="font-semibold truncate" data-testid="nav-user-name">{user?.name}</div>
          <div className="text-xs text-slate-500 truncate">{user?.email}</div>
        </div>
        <Button
          variant="outline"
          className="w-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30"
          onClick={() => { logout(); nav("/"); }}
          data-testid="nav-logout"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </aside>
  );
}
