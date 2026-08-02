import React, { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function Career() {
  const [skills, setSkills] = useState("");
  const [degree, setDegree] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/career/recommend", {
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        degree,
        interests: interests.split(",").map(s => s.trim()).filter(Boolean),
      });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="career-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Career <span className="text-emerald-400">Recommendations</span></h1>
        <p className="text-slate-400 mt-1">Get 4 personalized career paths with salary ranges and roadmaps.</p>
      </div>

      <div className="glass rounded-xl p-6 grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-slate-300">Skills (comma-separated)</Label>
          <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, React, SQL" className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid="career-skills" />
        </div>
        <div>
          <Label className="text-slate-300">Degree</Label>
          <Input value={degree} onChange={e => setDegree(e.target.value)} placeholder="B.S. Computer Science" className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid="career-degree" />
        </div>
        <div>
          <Label className="text-slate-300">Interests</Label>
          <Input value={interests} onChange={e => setInterests(e.target.value)} placeholder="AI, product, gaming" className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid="career-interests" />
        </div>
        <div className="md:col-span-3">
          <Button onClick={submit} disabled={loading || !skills || !degree} data-testid="career-generate-btn" className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
            {loading ? "Consulting Gemini…" : <><Sparkles className="w-4 h-4 mr-2" /> Generate paths</>}
          </Button>
        </div>
      </div>

      {result && (
        <div className="grid md:grid-cols-2 gap-6" data-testid="career-results">
          {result.recommendations?.map((r, i) => (
            <div key={i} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Match {r.match_percentage}%
                  </div>
                  <h3 className="font-display font-black text-2xl mt-1">{r.career}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 flex items-center gap-1 justify-end"><DollarSign className="w-3 h-3" /> Salary</div>
                  <div className="font-semibold text-emerald-400">{r.salary_range}</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 italic mb-4">"{r.why_fit}"</p>
              <div className="mb-4">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Required skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {r.required_skills?.map((s, j) => <span key={j} className="px-2.5 py-0.5 rounded-full text-xs bg-white/5 border border-white/10">{s}</span>)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Roadmap</div>
                <ol className="space-y-2">
                  {r.roadmap?.map((step, j) => (
                    <li key={j} className="text-sm flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-emerald-400 font-semibold text-xs">{j+1}</span>
                      <div>
                        <div className="font-semibold">{step.milestone} <span className="text-slate-500 font-normal text-xs">· {step.duration}</span></div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
