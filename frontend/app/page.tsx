"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const FEATURED_SUBJECTS = [
  { name: "English & ESL", teachers: "120+ tutors", icon: "🌍" },
  { name: "Mathematics & Calculus", teachers: "85+ tutors", icon: "📐" },
  { name: "Arabic Language", teachers: "64+ tutors", icon: "📖" },
  { name: "Computer Science & Python", teachers: "92+ tutors", icon: "💻" },
  { name: "Physics & Chemistry", teachers: "48+ tutors", icon: "🔬" },
  { name: "Music & Piano", teachers: "36+ tutors", icon: "🎵" },
];

const SAMPLE_TEACHERS = [
  {
    name: "Dr. Sarah Al-Mansoor",
    headline: "Cambridge Certified Math & Physics Tutor (10+ yrs)",
    rating: 4.95,
    reviewsCount: 128,
    rate: "$35",
    languages: ["English", "Arabic"],
    instantBooking: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    badge: "Super Teacher",
  },
  {
    name: "Marcus Vance",
    headline: "Senior Software Engineer & Coding Mentor for Beginners to Pro",
    rating: 5.0,
    reviewsCount: 94,
    rate: "$45",
    languages: ["English", "French"],
    instantBooking: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badge: "Top Rated",
  },
  {
    name: "Layla Chen",
    headline: "Native Mandarin & English Bilingual Educator & Accent Coach",
    rating: 4.92,
    reviewsCount: 76,
    rate: "$28",
    languages: ["English", "Mandarin"],
    instantBooking: false,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    badge: "Popular",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Discover Expert Teachers",
    desc: "Search verified teachers by subject, price range, native languages, and student reviews.",
  },
  {
    step: "02",
    title: "Check Live Availability",
    desc: "View real-time slots synced directly to your local timezone with dynamic rule scheduling.",
  },
  {
    step: "03",
    title: "Book & Learn 1-on-1",
    desc: "Instant book or request sessions, join single or recurring weekly series, and achieve your learning goals.",
  },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 font-bold text-slate-950 text-xl shadow-lg shadow-teal-500/20">
              د
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Deyar
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-300">
            <a href="#subjects" className="transition-colors hover:text-teal-400">
              Find Teachers
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-teal-400">
              How It Works
            </a>
            <a href="#teachers" className="transition-colors hover:text-teal-400">
              Featured Mentors
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-800" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">
                  Hi, {user.first_name || user.email.split("@")[0]}
                </span>
                <button
                  onClick={() => logout()}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <button
                  id="nav-login-btn"
                  onClick={() => openAuth("login")}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  Log in
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => openAuth("signup")}
                  className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 shadow-md shadow-teal-500/10"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/40 via-slate-950 to-slate-950"></div>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            Empowering 1-on-1 Personalized Education
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Find the perfect mentor to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              master any skill
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Connect with verified private teachers. Browse real-time dynamic availability, instant-book slots,
            or schedule recurring weekly sessions tailored to your pace.
          </p>

          {/* Search bar widget */}
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-2xl shadow-teal-950/40 backdrop-blur">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-950/60 p-3 text-left border border-slate-800/60">
                <label className="block text-xs font-medium text-slate-400">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Arabic"
                  className="mt-1 w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3 text-left border border-slate-800/60">
                <label className="block text-xs font-medium text-slate-400">Lesson Type</label>
                <select className="mt-1 w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer">
                  <option value="" className="bg-slate-900">Any duration</option>
                  <option value="30" className="bg-slate-900">30 min trial</option>
                  <option value="45" className="bg-slate-900">45 min lesson</option>
                  <option value="60" className="bg-slate-900">60 min standard</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("signup")}
                  className="w-full h-full min-h-[50px] rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-6 font-semibold text-slate-950 transition hover:brightness-110 shadow-lg shadow-teal-500/20"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>

          {/* Trust proof */}
          <div className="mt-10 flex items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-teal-400">✓</span> Verified Credentials
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-teal-400">✓</span> Instant & Flexible Booking
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-teal-400">✓</span> Timezone Auto-Sync
            </span>
          </div>
        </div>
      </section>

      {/* Featured Subjects */}
      <section id="subjects" className="border-t border-slate-800/80 bg-slate-900/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Explore Popular Subjects</h2>
              <p className="mt-2 text-slate-400">Choose from top academic disciplines, languages, and technical disciplines.</p>
            </div>
            <a href="#subjects" className="text-sm font-semibold text-teal-400 hover:text-teal-300">
              Browse all categories &rarr;
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SUBJECTS.map((sub) => (
              <div
                key={sub.name}
                className="group relative flex items-center gap-4 rounded-xl border border-slate-800/90 bg-slate-900/50 p-5 transition hover:border-teal-500/40 hover:bg-slate-900/80 cursor-pointer"
                onClick={() => openAuth("signup")}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800/80 text-2xl group-hover:scale-105 transition">
                  {sub.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-teal-300 transition">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{sub.teachers}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section id="teachers" className="border-t border-slate-800/80 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Meet Top Rated Instructors</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Every teacher is vetted for subject mastery, clear teaching methodology, and reliable punctuality.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {SAMPLE_TEACHERS.map((teacher) => (
              <div
                key={teacher.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl transition hover:border-slate-700 hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Image
                      src={teacher.avatar}
                      alt={teacher.name}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-500/20"
                    />
                    <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-500/20">
                      {teacher.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">{teacher.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{teacher.headline}</p>

                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      ★ {teacher.rating}
                    </span>
                    <span className="text-slate-500">({teacher.reviewsCount} reviews)</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{teacher.languages.join(", ")}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Hourly from</span>
                      <p className="text-lg font-bold text-white">{teacher.rate}<span className="text-xs font-normal text-slate-400">/hr</span></p>
                    </div>
                    <button
                      onClick={() => openAuth("signup")}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-400 hover:text-slate-950"
                    >
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-slate-800/80 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How Deyar Works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Smooth, conflict-free booking built specifically for modern tutors and ambitious students.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm"
              >
                <div className="text-3xl font-black text-teal-400/30">{item.step}</div>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-sm text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400 font-bold text-slate-950 text-sm">
              د
            </div>
            <span className="font-semibold text-slate-200">Deyar</span>
            <span className="text-xs">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button onClick={() => openAuth("signup")} className="hover:text-white transition">
              Become a Teacher
            </button>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
