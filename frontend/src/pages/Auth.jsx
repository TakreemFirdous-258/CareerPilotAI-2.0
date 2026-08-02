import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/app/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Welcome back" subtitle="Log in to your CareerPilot dashboard.">
    <form onSubmit={submit} className="space-y-5">
      <div>
        <Label className="text-slate-300">Email</Label>
        <Input data-testid="login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" />
      </div>
      <div>
        <Label className="text-slate-300">Password</Label>
        <Input data-testid="login-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" />
      </div>
      <Button type="submit" data-testid="login-submit" disabled={loading} className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
        {loading ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4 ml-1" /></>}
      </Button>
    </form>
    <div className="text-center text-sm text-slate-400 mt-6">
      New here? <Link to="/register" className="text-emerald-400 hover:text-emerald-300" data-testid="login-goto-register">Create account</Link>
    </div>
  </AuthShell>;
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created!");
      nav("/app/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Create your copilot" subtitle="Free forever. Your AI mentor awaits.">
    <form onSubmit={submit} className="space-y-5">
      <div>
        <Label className="text-slate-300">Full name</Label>
        <Input data-testid="register-name" required value={name} onChange={e => setName(e.target.value)} className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" />
      </div>
      <div>
        <Label className="text-slate-300">Email</Label>
        <Input data-testid="register-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" />
      </div>
      <div>
        <Label className="text-slate-300">Password</Label>
        <Input data-testid="register-password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 bg-white/5 border-white/10 focus:border-emerald-500 h-11" />
      </div>
      <Button type="submit" data-testid="register-submit" disabled={loading} className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold emerald-glow">
        {loading ? "Creating…" : <>Create account <ArrowRight className="w-4 h-4 ml-1" /></>}
      </Button>
    </form>
    <div className="text-center text-sm text-slate-400 mt-6">
      Already have an account? <Link to="/login" className="text-emerald-400 hover:text-emerald-300" data-testid="register-goto-login">Log in</Link>
    </div>
  </AuthShell>;
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 radial-emerald">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8" data-testid="auth-logo">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center emerald-glow">
            <Compass className="w-5 h-5 text-black" />
          </div>
          <div className="font-display font-bold text-xl">CareerPilot<span className="text-emerald-400">.AI</span></div>
        </Link>
        <div className="glass rounded-2xl p-8">
          <h1 className="font-display font-black text-3xl mb-2">{title}</h1>
          <p className="text-slate-400 text-sm mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
