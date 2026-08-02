import React, { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

export default function Interview() {
  const [role, setRole] = useState("");
  const [type, setType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluating, setEvaluating] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/interview/start", { role, interview_type: type, difficulty });
      setSession(data);
      setCurrent(0);
      setFeedbacks([]);
      setAnswer("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not start");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const q = session.questions[current];
      const { data } = await api.post("/interview/submit", {
        interview_id: session.interview_id,
        question: q.question,
        answer,
      });
      setFeedbacks([...feedbacks, { question: q.question, answer, ...data.evaluation }]);
      setAnswer("");
      if (current < session.questions.length - 1) setCurrent(current + 1);
      else toast.success(`Interview complete! Avg score: ${data.current_avg_score}`);
    } catch (err) {
      toast.error("Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="interview-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">AI Mock <span className="text-emerald-400">Interview</span></h1>
        <p className="text-slate-400 mt-1">Practice technical or HR rounds with instant Gemini feedback.</p>
      </div>

      {!session && (
        <div className="glass rounded-xl p-6 grid md:grid-cols-3 gap-4" data-testid="interview-setup">
          <div>
            <Label className="text-slate-300">Target role</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Engineer" className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid="interview-role" />
          </div>
          <div>
            <Label className="text-slate-300">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 h-11" data-testid="interview-type"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10">
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="hr">HR / Behavioral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 h-11" data-testid="interview-difficulty"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Button onClick={start} disabled={!role || loading} data-testid="interview-start-btn" className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
              {loading ? "Generating questions…" : <><Sparkles className="w-4 h-4 mr-2" /> Start interview</>}
            </Button>
          </div>
        </div>
      )}

      {session && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6" data-testid="interview-question-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-emerald-400 uppercase tracking-wide">Question {current + 1} / {session.questions.length}</div>
              <div className="text-xs text-slate-400">{type} · {difficulty}</div>
            </div>
            <div className="flex gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
              <p className="text-lg font-semibold">{session.questions[current]?.question}</p>
            </div>
            <Textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here…"
              rows={6}
              className="bg-white/5 border-white/10 focus:border-emerald-500"
              data-testid="interview-answer-input"
            />
            <Button onClick={submit} disabled={!answer.trim() || evaluating} data-testid="interview-submit-btn" className="w-full mt-4 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
              {evaluating ? "Evaluating…" : "Submit answer"}
            </Button>
          </div>

          {feedbacks.length > 0 && (
            <div className="space-y-4" data-testid="interview-feedback-list">
              <h3 className="font-display font-bold text-lg">Feedback so far</h3>
              {feedbacks.map((f, i) => (
                <div key={i} className="glass rounded-xl p-5">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-slate-400">Q{i+1}: {f.question}</div>
                    <div className="flex gap-4">
                      <ScorePill label="Score" value={f.score} />
                      <ScorePill label="Confidence" value={f.confidence} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2">{f.feedback}</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <div className="text-xs text-emerald-400 uppercase mb-1">Strengths</div>
                      <ul className="space-y-1">{f.strengths?.map((s, j) => <li key={j} className="text-slate-300">✓ {s}</li>)}</ul>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 uppercase mb-1">Improvements</div>
                      <ul className="space-y-1">{f.improvements?.map((s, j) => <li key={j} className="text-slate-300">! {s}</li>)}</ul>
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={() => setSession(null)} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="interview-reset-btn">Start new interview</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ScorePill = ({ label, value }) => (
  <div className="text-right">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-display font-black text-emerald-400 text-lg flex items-center gap-1 justify-end"><Star className="w-3 h-3 fill-emerald-400" />{value}</div>
  </div>
);
