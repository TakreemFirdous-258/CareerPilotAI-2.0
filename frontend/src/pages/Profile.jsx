import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "", phone: "", degree: "", education: "", target_role: "",
    skills: "", interests: "", projects: "", certificates: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/profile").then(r => {
      const u = r.data;
      setForm({
        name: u.name || "",
        phone: u.phone || "",
        degree: u.degree || "",
        education: u.education || "",
        target_role: u.target_role || "",
        skills: (u.skills || []).join(", "),
        interests: (u.interests || []).join(", "),
        projects: (u.projects || []).join(", "),
        certificates: (u.certificates || []).join(", "),
      });
    });
  }, []);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/profile", {
        name: form.name,
        phone: form.phone,
        degree: form.degree,
        education: form.education,
        target_role: form.target_role,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(",").map(s => s.trim()).filter(Boolean),
        projects: form.projects.split(",").map(s => s.trim()).filter(Boolean),
        certificates: form.certificates.split(",").map(s => s.trim()).filter(Boolean),
      });
      await refreshUser();
      toast.success("Profile updated");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const field = (k, label, placeholder) => (
    <div>
      <Label className="text-slate-300">{label}</Label>
      <Input value={form[k]} onChange={e => update(k, e.target.value)} placeholder={placeholder} className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" data-testid={`profile-${k}`} />
    </div>
  );

  return (
    <div className="space-y-6" data-testid="profile-page">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">Your <span className="text-emerald-400">Profile</span></h1>
        <p className="text-slate-400 mt-1">A complete profile gets better recommendations.</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          {field("name", "Full name", "Your name")}
          {field("phone", "Phone", "+1 555 …")}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {field("degree", "Degree", "B.S. Computer Science")}
          {field("education", "Education (school)", "Stanford, 2026")}
        </div>
        {field("target_role", "Target role", "Full Stack Developer")}
        {field("skills", "Skills (comma-separated)", "Python, React, SQL")}
        {field("interests", "Interests", "AI, product, gaming")}
        {field("projects", "Projects", "Chatbot app, Portfolio site")}
        {field("certificates", "Certificates", "AWS SAA, Google UX")}
        <Button onClick={save} disabled={saving} data-testid="profile-save-btn" className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
