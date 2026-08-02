import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Flame, Target, TrendingUp } from "lucide-react";

export default function Progress() {
  const [data, setData] = useState(null);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    api.get("/dashboard").then(r => setData(r.data));
    api.get("/interview/history").then(r => setInterviews(r.data));
  }, []);

  if (!data) return <div data-testid="progress-loading" className="text-slate-400">Loading…</div>;

  const skillGrowth = data.weekly_progress.map((d, i) => ({
    ...d,
    skills: Math.max(0, data.skills_count - (6 - i)),
  }));

  return (
    <div className="space-y-6" data-testid="progress-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Progress <span className="text-emerald-400">Tracker</span></h1>
        <p className="text-slate-400 mt-1">Track your resume, interview, and skill growth over time.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Learning streak" value={`${data.learning_streak} days`} icon={Flame} />
        <Stat label="Resume Score" value={`${data.resume_score}/100`} icon={Target} />
        <Stat label="Interview Score" value={`${data.interview_score}/100`} icon={TrendingUp} />
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-bold text-lg mb-4">Interview scores (7-day)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.weekly_progress}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="interview_score" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-bold text-lg mb-4">Skill growth</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={skillGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar dataKey="skills" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-bold text-lg mb-4">Interview history</h3>
        {interviews.length === 0 ? (
          <div className="text-slate-400 text-sm">No interviews yet.</div>
        ) : (
          <div className="space-y-2">
            {interviews.map((iv) => (
              <div key={iv.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <div className="font-semibold">{iv.role}</div>
                  <div className="text-xs text-slate-400 capitalize">{iv.type} · {iv.difficulty} · {iv.answers?.length || 0} answered</div>
                </div>
                <div className="font-display font-black text-emerald-400 text-xl">{iv.score}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Stat = ({ label, value, icon: Icon }) => (
  <div className="glass rounded-xl p-5">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <Icon className="w-4 h-4 text-emerald-400" />
    </div>
    <div className="font-display font-black text-2xl">{value}</div>
  </div>
);
