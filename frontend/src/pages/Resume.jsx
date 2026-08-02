import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    api.get("/resume/score").then(r => {
      if (r.data?.analysis) setAnalysis(r.data);
    });
  }, []);

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(data);
      toast.success(`ATS Score: ${data.ats_score}/100`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const a = analysis?.analysis;

  return (
    <div className="space-y-6" data-testid="resume-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Resume <span className="text-emerald-400">ATS Analyzer</span></h1>
        <p className="text-slate-400 mt-1">Upload your resume (PDF or TXT). We'll grade it and tell you what to fix.</p>
      </div>

      <div className="glass rounded-xl p-6">
        <label className="block cursor-pointer" data-testid="resume-dropzone">
          <input
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            data-testid="resume-file-input"
          />
          <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-emerald-500/40 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-emerald-400 mb-3" />
            <div className="font-semibold mb-1">{file ? file.name : "Drop your resume here"}</div>
            <div className="text-xs text-slate-400">PDF or TXT, max 5 MB</div>
          </div>
        </label>
        <Button
          onClick={submit}
          disabled={!file || uploading}
          data-testid="resume-analyze-btn"
          className="w-full mt-4 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow"
        >
          {uploading ? "Analyzing with Gemini…" : <><Sparkles className="w-4 h-4 mr-2" /> Analyze resume</>}
        </Button>
      </div>

      {a && (
        <div className="space-y-6" data-testid="resume-results">
          <div className="grid md:grid-cols-4 gap-4">
            <ScoreCard label="ATS Score" value={a.ats_score} big />
            <ScoreCard label="Keywords" value={a.keyword_density} />
            <ScoreCard label="Formatting" value={a.formatting_score} />
            <ScoreCard label="Impact" value={a.impact_score} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-lg">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {a.strengths?.map((s, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-400">✓</span>{s}</li>)}
              </ul>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-lg">Weaknesses</h3>
              </div>
              <ul className="space-y-2">
                {a.weaknesses?.map((s, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-amber-400">!</span>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-bold text-lg mb-3">AI Suggestions</h3>
            <ol className="space-y-3">
              {a.suggestions?.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-emerald-400 font-semibold text-xs">{i+1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-bold text-lg mb-3">Detected skills</h3>
            <div className="flex flex-wrap gap-2">
              {a.detected_skills?.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ScoreCard = ({ label, value, big }) => (
  <div className="glass rounded-xl p-5">
    <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">{label}</div>
    <div className={`font-display font-black ${big ? "text-5xl" : "text-3xl"} text-emerald-400`}>
      {value}<span className="text-slate-500 text-base font-normal">/100</span>
    </div>
    <Progress value={value} className="mt-3 h-1.5 bg-white/5" />
  </div>
);
