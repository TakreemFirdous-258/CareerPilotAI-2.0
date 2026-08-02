import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, FileText, Target, MessageSquare, GraduationCap, Briefcase, LineChart, Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: FileText, title: "ATS Resume Builder", desc: "AI grades your resume 0–100 and rewrites weak lines instantly.", testId: "feature-resume" },
  { icon: Target, title: "Career Recommender", desc: "Get 4 personalized career paths with salary ranges and roadmaps.", testId: "feature-career" },
  { icon: MessageSquare, title: "AI Mock Interview", desc: "Practice technical & HR rounds with instant scored feedback.", testId: "feature-interview" },
  { icon: GraduationCap, title: "Skill Gap Analyzer", desc: "See exactly which skills you lack and a weekly plan to close them.", testId: "feature-skills" },
  { icon: Briefcase, title: "Smart Job Match", desc: "Curated roles ranked by how well they match your profile.", testId: "feature-jobs" },
  { icon: LineChart, title: "Progress Tracker", desc: "Visualize resume, interview and skill growth over weeks.", testId: "feature-progress" },
];

const testimonials = [
  { name: "Priya S.", role: "CS Senior", quote: "Went from 58 to 91 ATS score in a week. Landed 3 interviews." },
  { name: "Marcus D.", role: "Bootcamp Grad", quote: "The mock interviews felt real. The confidence score is addictive." },
  { name: "Ananya K.", role: "MBA Fresher", quote: "The roadmap gave me a week-by-week plan I actually followed." },
];

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center emerald-glow">
              <Compass className="w-5 h-5 text-black" />
            </div>
            <div className="font-display font-bold text-lg">CareerPilot<span className="text-emerald-400">.AI</span></div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" data-testid="landing-login-link">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">Login</Button>
            </Link>
            <Link to="/register" data-testid="landing-signup-cta">
              <Button className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative radial-emerald">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-emerald-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini 3.1 Pro
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
              Your entire <span className="text-emerald-400">career journey,</span> guided by one AI copilot.
            </h1>
            <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl">
              Build ATS resumes, map skill gaps, practice interviews, and land interviews — all in one dark-mode dashboard built for ambitious students.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" data-testid="hero-primary-cta">
                <Button size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-7 h-12 emerald-glow">
                  Start Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/login" data-testid="hero-secondary-cta">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40">
                  I have an account
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
              <div><span className="text-white font-bold text-xl">12k+</span> students</div>
              <div className="w-px h-8 bg-white/10" />
              <div><span className="text-white font-bold text-xl">89%</span> ATS pass rate</div>
              <div className="w-px h-8 bg-white/10" />
              <div><span className="text-white font-bold text-xl">4.9★</span> rated</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
            <div className="glass rounded-2xl p-6 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1710438399422-2fca27686bcd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGVtZXJhbGQlMjBncmVlbiUyMGRhcmt8ZW58MHx8fHwxNzg1NTgzNDEzfDA&ixlib=rb-4.1.0&q=85"
                alt="abstract"
                className="rounded-xl w-full h-72 object-cover opacity-70"
              />
              <div className="absolute top-10 left-10 glass rounded-xl p-4 max-w-[220px]">
                <div className="text-xs text-slate-400">ATS Score</div>
                <div className="text-3xl font-display font-black text-emerald-400">92<span className="text-lg text-white">/100</span></div>
                <div className="text-xs text-emerald-300 mt-1">+18 vs last upload</div>
              </div>
              <div className="absolute bottom-10 right-8 glass rounded-xl p-4 max-w-[240px]">
                <div className="text-xs text-slate-400">Recommended</div>
                <div className="font-display font-bold">ML Engineer</div>
                <div className="text-xs text-emerald-300">94% match • $200k+</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <div className="text-emerald-400 text-sm uppercase tracking-widest mb-3">Everything you need</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl mb-4">One dashboard. Seven career superpowers.</h2>
            <p className="text-slate-400">Instead of jumping between five tools, run your entire job search from a single AI-guided cockpit.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass glass-hover rounded-xl p-6"
                data-testid={f.testId}
              >
                <div className="w-11 h-11 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-12">Students shipping offers.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />)}
                </div>
                <p className="text-slate-300 mb-4">"{t.quote}"</p>
                <div className="text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-10 lg:p-14 text-center relative overflow-hidden radial-emerald">
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl mb-4">Ready to ship offers, not applications?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Free to start. No credit card. Your AI copilot is one click away.</p>
          <Link to="/register" data-testid="cta-register">
            <Button size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 h-12 emerald-glow">
              Launch my career dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 px-6 text-center text-sm text-slate-500">
        © 2026 CareerPilot AI · Built for ambitious students
      </footer>
    </div>
  );
}
