import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { FileText, MessageSquare, TrendingUp, Briefcase, Flame, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar } from "recharts";
import { Link } from "react-router-dom";

const MetricCard = ({ icon: Icon, label, value, suffix, testId, tone = "emerald" }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="glass glass-hover rounded-xl p-5" data-testid={testId}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`w-8 h-8 rounded-lg bg-${tone}-500/15 border border-${tone}-500/25 flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
    <div className="font-display font-black text-3xl">
      {value}<span className="text-slate-500 text-lg font-normal">{suffix}</span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard").then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="text-slate-400" data-testid="dashboard-loading">Loading dashboard…</div>;

  const gauge = [{ name: "Profile", value: data.profile_completion, fill: "#10b981" }];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Welcome back, <span className="text-emerald-400">{user?.name?.split(" ")[0]}</span></h1>
        <p className="text-slate-400 mt-1">Here's your career cockpit for today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={FileText} label="Resume Score" value={data.resume_score} suffix="/100" testId="metric-resume" />
        <MetricCard icon={MessageSquare} label="Interview Score" value={data.interview_score} suffix="/100" testId="metric-interview" />
        <MetricCard icon={Target} label="Skills Tracked" value={data.skills_count} testId="metric-skills" />
        <MetricCard icon={Briefcase} label="Jobs Applied" value={data.jobs_applied} testId="metric-jobs" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 lg:col-span-2" data-testid="weekly-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Last 7 days</div>
              <h3 className="font-display font-bold text-lg">Interview performance</h3>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.weekly_progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="interview_score" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-6" data-testid="profile-completion">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Profile completion</div>
          <h3 className="font-display font-bold text-lg mb-2">Fill it up</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={gauge} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={20} fill="#10b981" background={{ fill: "rgba(255,255,255,0.05)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-24 mb-16 relative pointer-events-none">
            <div className="font-display font-black text-4xl text-emerald-400">{data.profile_completion}%</div>
          </div>
          <Link to="/app/profile" data-testid="cta-complete-profile">
            <button className="w-full mt-2 py-2.5 rounded-full glass glass-hover text-sm font-medium">Complete profile →</button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-lg">Recent interviews</h3>
          </div>
          {data.recent_interviews.length === 0 ? (
            <div className="text-sm text-slate-400" data-testid="empty-interviews">
              No interviews yet. <Link to="/app/interview" className="text-emerald-400">Start one →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_interviews.map((iv, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <div className="font-semibold">{iv.role}</div>
                    <div className="text-xs text-slate-400 capitalize">{iv.type} interview</div>
                  </div>
                  <div className="font-display font-black text-emerald-400 text-xl">{iv.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-display font-bold text-lg mb-4">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction to="/app/resume" title="Upload resume" testId="qa-resume" />
            <QuickAction to="/app/interview" title="Mock interview" testId="qa-interview" />
            <QuickAction to="/app/career" title="Career advice" testId="qa-career" />
            <QuickAction to="/app/jobs" title="Browse jobs" testId="qa-jobs" />
          </div>
        </div>
      </div>
    </div>
  );
}

const QuickAction = ({ to, title, testId }) => (
  <Link to={to} data-testid={testId}>
    <div className="glass glass-hover rounded-lg p-4 text-sm font-medium h-full flex items-center justify-center text-center">{title}</div>
  </Link>
);
