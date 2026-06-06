
"use client";

import { useEffect, useState } from "react";
import ProgressChart from "./components/ProgressChart";
import MindfulnessOasis from "./components/MindfulnessOasis";
import toast, { Toaster } from "react-hot-toast";
import { calculateWellnessScore } from "./utils/scoreEngine";
import { detectBurnout } from "./utils/triggerEngine";
import {
  Brain, Heart, Sparkles, PlusCircle, LineChart,
  ShieldAlert, BookOpen, Clock, Activity, Calendar,
  FileText, Trash2, AlertCircle, RefreshCw, Moon
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("checkin");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [burnout, setBurnout] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    exam: "",
    mood: "",
    stress: "5",
    sleep: "7",
    studyHours: "8",
    trigger: "",
    reflection: "",
  });

  const MOODS = [
    { name: "Happy", emoji: "😊", desc: "Positive & Energetic" },
    { name: "Okay", emoji: "😐", desc: "Steady & Content" },
    { name: "Stressed", emoji: "😰", desc: "Feeling Pressured" },
    { name: "Anxiety", emoji: "🤢", desc: "Nervous & Restless" },
    { name: "Burnout", emoji: "😴", desc: "Tired & Exhausted" }
  ];

  const EXAMS = ["NEET", "JEE", "UPSC", "CAT", "GATE", "CUET", "Boards"];

  const TRIGGERS = [
    "Exam Pressure",
    "Fear of Failure",
    "Low Mock Test Score",
    "Parents Pressure",
    "Result Anxiety",
    "Sleep Issues",
    "Time Management",
    "Self Doubt"
  ];

  useEffect(() => {
    const saved = localStorage.getItem("mentalTracker");
    const savedHistory = localStorage.getItem("wellnessHistory");

    // Asynchronously set state to avoid synchronous cascading renders on mount
    setTimeout(() => {
      if (saved) {
        try {
          setForm(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading mentalTracker", e);
        }
      }
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Error loading wellnessHistory", e);
        }
      }
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("mentalTracker", JSON.stringify(form));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const setMoodValue = (moodName) => {
    setForm((prev) => ({
      ...prev,
      mood: moodName,
    }));
    setErrors((prev) => ({
      ...prev,
      mood: "",
    }));
  };

  const setTriggerValue = (triggerName) => {
    setForm((prev) => ({
      ...prev,
      trigger: triggerName,
    }));
    setErrors((prev) => ({
      ...prev,
      trigger: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.exam.trim()) {
      newErrors.exam = "Please select your target exam";
    }
    if (!form.mood.trim()) {
      newErrors.mood = "Please select your current mood";
    }
    if (!form.stress || Number(form.stress) < 1 || Number(form.stress) > 10) {
      newErrors.stress = "Stress level must be between 1 and 10";
    }
    if (!form.sleep || Number(form.sleep) < 1 || Number(form.sleep) > 24) {
      newErrors.sleep = "Sleep hours must be realistic (1–24 hours)";
    }
    if (!form.studyHours || Number(form.studyHours) < 0 || Number(form.studyHours) > 18) {
      newErrors.studyHours = "Study hours must be realistic (0–18 hours)";
    }
    if (!form.trigger.trim()) {
      newErrors.trigger = "Please select what is triggering stress";
    }
    if (!form.reflection.trim()) {
      newErrors.reflection = "Reflection journal is required. Write a short paragraph.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required check-in fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const scoreResult = calculateWellnessScore({
        mood: form.mood,
        sleep: Number(form.sleep),
        studyHours: Number(form.studyHours),
        stress: Number(form.stress),
      });
      setScore(scoreResult);

      const burnoutData = detectBurnout({
        stress: Number(form.stress),
        sleep: Number(form.sleep),
        studyHours: Number(form.studyHours),
      });
      setBurnout(burnoutData);

      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to AI Wellness Advisor.");
      }

      const data = await res.json();
      setAiResult(data);

      const newHistoryEntry = {
        date: new Date().toISOString(),
        exam: form.exam,
        mood: form.mood,
        stress: form.stress,
        sleep: form.sleep,
        studyHours: form.studyHours,
        trigger: form.trigger,
        reflection: form.reflection,
        score: scoreResult,
        burnout: burnoutData,
        aiResult: data,
      };

      const updatedHistory = [newHistoryEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("wellnessHistory", JSON.stringify(updatedHistory));

      setForm((prev) => ({
        ...prev,
        reflection: "",
      }));

      toast.success("Wellness check-in completed & logs recorded!");
    } catch (error) {
      toast.error(error.message || "An error occurred. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your check-in history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem("wellnessHistory");
      toast.success("History successfully cleared.");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col font-sans transition-all">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">

        {/* Navbar Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                SerenePrep <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">Google Challenge</span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Mental wellness & cognitive support during competitive exams</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab("checkin")}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "checkin"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <PlusCircle className="w-4 h-4" /> Check-In
            </button>
            <button
              onClick={() => setActiveTab("growth")}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "growth"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <LineChart className="w-4 h-4" /> My Growth
            </button>
            <button
              onClick={() => setActiveTab("oasis")}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "oasis"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Heart className="w-4 h-4" /> Mindfulness Oasis
            </button>
          </nav>
        </header>

        {/* Tab Contents */}
        <div className="flex-grow">
          {activeTab === "checkin" && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">

              {/* Daily Check-in Form */}
              <div className="lg:col-span-7 glass-panel rounded-3xl p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Activity className="text-indigo-400 w-6 h-6" /> Daily Mind Check-In
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Take a minute to reflect on your day, study loads, and emotions</p>
                </div>

                <div className="space-y-5">

                  {/* Select Exam & Input study hours side-by-side */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Target Exam</label>
                      <select
                        name="exam"
                        value={form.exam}
                        onChange={handleChange}
                        className="w-full glass-input rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Select Target Exam</option>
                        {EXAMS.map(ex => (
                          <option key={ex} value={ex} className="bg-slate-900 text-white">{ex}</option>
                        ))}
                      </select>
                      {errors.exam && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.exam}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Daily Study Time</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          name="studyHours"
                          min="0"
                          max="18"
                          placeholder="Study hours today"
                          value={form.studyHours}
                          onChange={handleChange}
                          className="w-full glass-input rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 pl-11"
                        />
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-4" />
                        <span className="text-xs text-slate-400 absolute right-4 font-medium pointer-events-none">hrs / day</span>
                      </div>
                      {errors.studyHours && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.studyHours}</p>}
                    </div>
                  </div>

                  {/* Mood Selector cards */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">How is your mood today?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {MOODS.map((m) => {
                        const isSelected = form.mood === m.name;
                        return (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => setMoodValue(m.name)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${isSelected
                                ? "bg-indigo-600/30 border-indigo-500 text-white scale-[1.03] shadow-md shadow-indigo-500/20"
                                : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                              }`}
                          >
                            <span className="text-3xl mb-1.5">{m.emoji}</span>
                            <span className="text-xs font-bold">{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.mood && <p className="text-rose-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.mood}</p>}
                  </div>

                  {/* Stress Slider & Sleep Input */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Stress Level (1-10)</label>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(form.stress) >= 8 ? "bg-rose-500/20 text-rose-300" :
                            Number(form.stress) >= 5 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                          {form.stress} / 10 - {
                            Number(form.stress) >= 8 ? "Severe Stress" :
                              Number(form.stress) >= 5 ? "Moderate Pressure" : "Calm Mind"
                          }
                        </span>
                      </div>
                      <input
                        type="range"
                        name="stress"
                        min="1"
                        max="10"
                        value={form.stress}
                        onChange={handleChange}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                      />
                      {errors.stress && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.stress}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Sleep Duration</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          name="sleep"
                          min="1"
                          max="24"
                          placeholder="Sleep hours last night"
                          value={form.sleep}
                          onChange={handleChange}
                          className="w-full glass-input rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 pl-11"
                        />
                        <Moon className="w-4 h-4 text-slate-400 absolute left-4" />
                        <span className="text-xs text-slate-400 absolute right-4 font-medium pointer-events-none">hours</span>
                      </div>
                      {errors.sleep && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.sleep}</p>}
                    </div>
                  </div>

                  {/* Primary Stress Trigger */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">Primary Stress Trigger</label>
                    <div className="flex flex-wrap gap-2">
                      {TRIGGERS.map((t) => {
                        const isSelected = form.trigger === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTriggerValue(t)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${isSelected
                                ? "bg-indigo-600/35 border-indigo-400 text-white"
                                : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-slate-700/60"
                              }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    {errors.trigger && <p className="text-rose-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.trigger}</p>}
                  </div>

                  {/* Reflection Journal text area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Reflection Journal</label>
                    <textarea
                      rows={3}
                      name="reflection"
                      placeholder="Share your raw thoughts, study wins, mock scores, or fears. Let your mind flow..."
                      value={form.reflection}
                      onChange={handleChange}
                      className="w-full glass-input rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    {errors.reflection && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.reflection}</p>}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl p-4 font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing & Generating Report...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Get Gemini-AI Wellness Advice
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* Assessment and AI Support Panels */}
              <div className="lg:col-span-5 space-y-6">

                {/* 1. Score & Burnout Assessment Panel */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wellness Index</h3>
                    <div className="mt-4">
                      <div className="text-4xl font-black text-indigo-400">{score ? `${score}/100` : "--"}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Calculated from stress, sleep, & study balancing.</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Burnout Risk</h3>
                    <div className="mt-4">
                      <div className={`text-2xl font-black ${burnout?.risk === "High" ? "text-rose-400" : "text-emerald-400"
                        }`}>
                        {burnout ? burnout.risk : "--"}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">{burnout ? burnout.message : "Perform a check-in to run detection."}</p>
                    </div>
                  </div>
                </div>

                {/* 2. AI Advice Response Panel */}
                <div className="glass-panel rounded-3xl p-6 min-h-[350px] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-yellow-400 w-5 h-5" /> Personalized AI Support
                      </h2>
                      {aiResult && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aiResult.mode === "gemini"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : aiResult.mode === "openai"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }`}>
                          {aiResult.mode === "gemini" ? "🤖 Gemini AI" : aiResult.mode === "openai" ? "🤖 OpenAI" : "⚡ Smart Offline"}
                        </span>
                      )}
                    </div>

                    {aiResult ? (
                      <div className="space-y-4">

                        {/* Tip */}
                        <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Practical Stress Buster</h4>
                          <p className="text-sm text-slate-200 leading-relaxed">💡 {aiResult.tip}</p>
                        </div>

                        {/* Motivation */}
                        <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                          <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">Mindset Shift</h4>
                          <p className="text-sm text-slate-200 leading-relaxed">❤️ {aiResult.motivation}</p>
                        </div>

                        {/* Custom Affirmation Card */}
                        {aiResult.affirmation && (
                          <div className="bg-slate-900/60 rounded-2xl p-4 border border-yellow-400/10">
                            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">Your Focus Mantra</h4>
                            <p className="text-sm text-slate-200 italic">&ldquo;{aiResult.affirmation}&rdquo;</p>
                          </div>
                        )}

                        {/* Custom Warning Alert */}
                        {aiResult.warning && (
                          <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/20 text-rose-300 text-xs flex gap-2">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <div>
                              <span className="font-bold">Advisor Flag:</span> {aiResult.warning}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                        <Brain className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                        <p className="text-sm font-semibold text-slate-400">Advisor is Ready</p>
                        <p className="text-xs text-slate-500 max-w-[250px] mt-1">Submit your daily stats and journal details to generate customized study tips and AI support.</p>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
                    Disclaimer: This tool is meant for stress tracking and emotional reflection support only. It is not a substitute for professional counseling or medical healthcare advice.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === "growth" && (
            <div className="space-y-6">

              {/* Dual Y-axis Progress chart */}
              <ProgressChart history={history} />

              {/* Logs Log list */}
              <div className="glass-panel rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-indigo-400 w-5 h-5" /> Detailed Check-in History
                    </h2>
                    <p className="text-xs text-slate-400">Review your past reflections and scores</p>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs flex items-center gap-1.5 text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-all font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </button>
                  )}
                </div>

                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((h, i) => (
                      <div key={i} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 hover:border-slate-800/80 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs bg-slate-800 text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700 font-semibold">
                              {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 py-1 px-2.5 rounded-lg border border-indigo-500/20">
                              {h.exam}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-xs text-slate-400">
                              Wellness Index: <strong className="text-indigo-400">{h.score}/100</strong>
                            </div>
                            <div className="text-xs text-slate-400">
                              Burnout: <strong className={h.burnout?.risk === "High" ? "text-rose-400" : "text-emerald-400"}>{h.burnout?.risk || "Low"}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-12 gap-4 text-xs">
                          {/* Stats info */}
                          <div className="md:col-span-4 grid grid-cols-3 md:flex md:flex-col gap-2.5 border-r border-white/5 pr-4">
                            <div>
                              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">Mood</span>
                              <span className="text-white text-sm font-medium">{h.mood}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">Sleep</span>
                              <span className="text-white text-sm font-medium">{h.sleep} hrs</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">Study</span>
                              <span className="text-white text-sm font-medium">{h.studyHours} hrs</span>
                            </div>
                            <div className="col-span-3">
                              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">Trigger</span>
                              <span className="text-white text-xs font-medium">{h.trigger}</span>
                            </div>
                          </div>

                          {/* Reflections info */}
                          <div className="md:col-span-8 space-y-3 pl-2">
                            <div>
                              <span className="text-indigo-400 block uppercase tracking-wider font-bold text-[9px] mb-0.5 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Reflection Journal
                              </span>
                              <p className="text-slate-200 leading-relaxed italic">&ldquo;{h.reflection}&rdquo;</p>
                            </div>
                            {h.aiResult && (
                              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-2">
                                <span className="text-emerald-400 block uppercase tracking-wider font-bold text-[9px] flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> AI Advice Response
                                </span>
                                <p className="text-slate-300 leading-relaxed"><strong className="text-white">Tip:</strong> {h.aiResult.tip}</p>
                                {h.aiResult.affirmation && (
                                  <p className="text-slate-400 italic text-[11px]">&ldquo;{h.aiResult.affirmation}&rdquo;</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                    <Calendar className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-400">No Check-in History Available</p>
                    <p className="text-xs text-slate-500 max-w-[280px] mt-1">Your logged entries and customized recommendations will appear here.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === "oasis" && (
            <MindfulnessOasis />
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-16 border-t border-white/5 pt-6 pb-4 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Designed for student resilience, focus optimization, and anxiety tracking. Built with React and powered by Google Gemini AI pipelines.
          </p>
        </footer>

      </div>
    </main>
  );
}