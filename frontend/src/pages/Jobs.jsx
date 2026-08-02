import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, TrendingUp, Filter } from "lucide-react";
import { toast } from "sonner";

export default function Jobs() {
  const [tab, setTab] = useState("recommended");
  const [jobs, setJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loc, setLoc] = useState("");
  const [remote, setRemote] = useState(false);
  const [applied, setApplied] = useState(new Set());

  const loadJobs = async () => {
    const params = {};
    if (loc) params.location = loc;
    if (remote) params.remote = true;
    const { data } = await api.get("/jobs", { params });
    setJobs(data);
  };

  const loadRecommended = async () => {
    const { data } = await api.get("/recommended-jobs");
    setRecommended(data);
  };

  useEffect(() => {
    loadJobs();
    loadRecommended();
    api.get("/profile").then(r => setApplied(new Set(r.data.jobs_applied || [])));
  }, []);

  const apply = async (job) => {
    try {
      await api.post("/jobs/apply", { job_id: job.id });
      setApplied(prev => new Set(prev).add(job.id));
      toast.success(`Applied to ${job.title}`);
    } catch { toast.error("Could not apply"); }
  };

  const list = tab === "recommended" ? recommended : jobs;

  return (
    <div className="space-y-6" data-testid="jobs-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Job <span className="text-emerald-400">Board</span></h1>
        <p className="text-slate-400 mt-1">Roles ranked by profile fit. Update your skills to sharpen recommendations.</p>
      </div>

      <div className="glass rounded-xl p-2 inline-flex gap-1">
        <TabBtn active={tab === "recommended"} onClick={() => setTab("recommended")} testId="tab-recommended">For you</TabBtn>
        <TabBtn active={tab === "all"} onClick={() => setTab("all")} testId="tab-all">All jobs</TabBtn>
      </div>

      {tab === "all" && (
        <div className="glass rounded-xl p-4 flex flex-wrap items-end gap-4" data-testid="jobs-filters">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-slate-300 text-xs">Location</Label>
            <Input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Remote, SF, NY…" className="mt-1 bg-white/5 border-white/10 focus:border-emerald-500 h-10" data-testid="jobs-filter-location" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={remote} onCheckedChange={setRemote} data-testid="jobs-filter-remote" />
            <span className="text-sm">Remote only</span>
          </div>
          <Button onClick={loadJobs} data-testid="jobs-filter-apply" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
            <Filter className="w-4 h-4 mr-1" /> Apply filters
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {list.length === 0 && <div className="text-slate-400 text-sm" data-testid="jobs-empty">No jobs match. Try clearing filters.</div>}
        {list.map((j) => (
          <div key={j.id} className="glass glass-hover rounded-xl p-5" data-testid={`job-${j.id}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">{j.title}</h3>
                    <div className="text-sm text-slate-400">{j.company}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {j.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {j.salary}</span>
                  <span>{j.experience}</span>
                  {j.remote && <Badge className="bg-emerald-500/15 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20">Remote</Badge>}
                </div>
                <p className="text-sm text-slate-300 mt-3">{j.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {j.match_percentage != null && (
                  <div className="text-right">
                    <div className="text-xs text-slate-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Match</div>
                    <div className="font-display font-black text-emerald-400 text-2xl">{j.match_percentage}%</div>
                  </div>
                )}
                <Button
                  onClick={() => apply(j)}
                  disabled={applied.has(j.id)}
                  data-testid={`apply-${j.id}`}
                  className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold disabled:opacity-50"
                >
                  {applied.has(j.id) ? "Applied ✓" : "Apply"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TabBtn = ({ active, onClick, children, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-500 text-black" : "text-slate-300 hover:bg-white/5"}`}
  >{children}</button>
);
