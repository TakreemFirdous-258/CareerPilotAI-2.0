import React, { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, GraduationCap, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Skills() {
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/skill-gap", {
        current_skills: current.split(",").map(s => s.trim()).filter(Boolean),
        target_role: target,
      });
      setResult(data);
    } catch (err) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="skills-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Skill Gap <span className="text-emerald-400">Analyzer</span></h1>
        <p className="text-slate-400 mt-1">See what you're missing to land your target role — with a week-by-week plan.</p>
      </div>

      <div className="glass rounded-xl p-6 grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Current skills</Label>
          <Input value={current} onChange={e => setCurrent(e.target.value)} placeholder="Python, HTML, CSS, Git" className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid="skills-current" />
        </div>
        <div>
          <Label className="text-slate-300">Target role</Label>
          <Input value={target} onChange={e => setTarget(e.target.value)} placeholder="Full Stack Developer" className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid="skills-target" />
        </div>
        <div className="md:col-span-2">
          <Button onClick={submit} disabled={loading || !current || !target} data-testid="skills-analyze-btn" className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
            {loading ? "Analyzing gap…" : <><Sparkles className="w-4 h-4 mr-2" /> Find my gaps</>}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-6" data-testid="skills-results">
          <div className="glass rounded-xl p-6 text-center radial-emerald">
            <div className="text-xs text-slate-400 uppercase tracking-wide">Match with {target}</div>
            <div className="font-display font-black text-6xl text-emerald-400 mt-2">{result.match_score}%</div>
            <div className="text-sm text-slate-400 mt-2">Estimated readiness in <span className="text-emerald-300 font-semibold">{result.learning_timeline_weeks} weeks</span></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <SkillList title="You have" items={result.existing_relevant} tone="emerald" icon={CheckCircle2} testId="skills-existing" />
            <SkillList title="Must learn" items={result.missing_critical} tone="rose" icon={XCircle} testId="skills-missing-critical" />
            <SkillList title="Nice to have" items={result.missing_nice_to_have} tone="amber" icon={GraduationCap} testId="skills-nice" />
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">Suggested courses</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {result.suggested_courses?.map((c, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{c.platform} · {c.duration} · <span className="text-emerald-400 capitalize">{c.level}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-lg">Weekly plan</h3>
            </div>
            <div className="space-y-3">
              {result.weekly_plan?.map((w) => (
                <div key={w.week} className="flex gap-4 p-3 rounded-lg bg-white/5">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0 flex flex-col items-center justify-center">
                    <div className="text-xs text-emerald-400 leading-none">WEEK</div>
                    <div className="font-display font-black text-emerald-400">{w.week}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{w.focus}</div>
                    <div className="text-sm text-slate-400">{w.goal}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SkillList = ({ title, items, tone, icon: Icon, testId }) => (
  <div className="glass rounded-xl p-6" data-testid={testId}>
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-5 h-5 text-${tone}-400`} />
      <h3 className="font-display font-bold text-lg">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {items?.length ? items.map((s, i) => (
        <span key={i} className={`px-3 py-1 rounded-full text-xs bg-${tone}-500/15 border border-${tone}-500/25 text-${tone}-300`}>{s}</span>
      )) : <div className="text-sm text-slate-500">None</div>}
    </div>
  </div>
);
