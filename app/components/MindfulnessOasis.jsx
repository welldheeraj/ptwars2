"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Wind, Clock, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const AFFIRMATIONS = [
  "My worth is not defined by an exam score or mock result. I am doing my absolute best.",
  "I am capable of handling this pressure. One concept, one problem at a time.",
  "Stress is just energy waiting to be transformed. I breathe in calm, I breathe out worry.",
  "I have prepared well, and my mind is clear, focused, and sharp.",
  "Taking a break is not wasting time; it is repairing my strength for the next steps.",
  "I am much more than my academic grades. I am resilient, intelligent, and valued.",
  "Every difficulty I face is building my strength, character, and intellect.",
  "I choose progress over perfection, and consistency over anxiety.",
  "My brain is capable of learning complex things. I will trust my process."
];

export default function MindfulnessOasis() {
  // --- Guided Breathing States ---
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingStage, setBreathingStage] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold empty
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const breathingIntervalRef = useRef(null);

  const stages = [
    { text: "Breathe In...", color: "bg-teal-500", scale: "scale-125", shadow: "shadow-[0_0_50px_rgba(20,184,166,0.6)]" },
    { text: "Hold...", color: "bg-indigo-500", scale: "scale-125", shadow: "shadow-[0_0_60px_rgba(99,102,241,0.6)]" },
    { text: "Breathe Out...", color: "bg-cyan-500", scale: "scale-100", shadow: "shadow-[0_0_30px_rgba(6,182,212,0.4)]" },
    { text: "Hold (Empty)...", color: "bg-slate-700", scale: "scale-100", shadow: "shadow-none" }
  ];

  useEffect(() => {
    if (breathingActive) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            setBreathingStage((prevStage) => (prevStage + 1) % 4);
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(breathingIntervalRef.current);
    }
    return () => clearInterval(breathingIntervalRef.current);
  }, [breathingActive]);

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathingSeconds(4);
      setBreathingStage(0);
    } else {
      setBreathingActive(true);
      toast.success("Guided Box Breathing Started! 4s-4s-4s-4s rhythm.");
    }
  };

  // --- Pomodoro States ---
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState("study"); // "study" or "break"
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const pomoIntervalRef = useRef(null);

  useEffect(() => {
    if (pomoActive) {
      pomoIntervalRef.current = setInterval(() => {
        setPomoSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(pomoIntervalRef.current);
            setPomoActive(false);
            if (pomoMode === "study") {
              toast.success("Focus study session completed! Take a mindful break. 🧘", { duration: 6000 });
              setPomoMode("break");
              return 5 * 60;
            } else {
              toast.success("Break completed! Ready to focus? Let's start. 📚", { duration: 6000 });
              setPomoMode("study");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(pomoIntervalRef.current);
    }
    return () => clearInterval(pomoIntervalRef.current);
  }, [pomoActive, pomoMode]);

  const formatPomoTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePomoToggle = () => {
    setPomoActive(!pomoActive);
  };

  const handlePomoReset = () => {
    setPomoActive(false);
    setPomoSeconds(pomoMode === "study" ? 25 * 60 : 5 * 60);
  };

  const changePomoMode = (mode) => {
    setPomoActive(false);
    setPomoMode(mode);
    setPomoSeconds(mode === "study" ? 25 * 60 : 5 * 60);
  };

  // --- Affirmation States ---
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [flip, setFlip] = useState(false);

  const getNewAffirmation = () => {
    setFlip(true);
    setTimeout(() => {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * AFFIRMATIONS.length);
      } while (nextIdx === affirmationIdx && AFFIRMATIONS.length > 1);
      setAffirmationIdx(nextIdx);
      setFlip(false);
    }, 200);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Box Breathing */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-between min-h-[350px] transition-all">
        <div className="flex items-center gap-2 mb-4">
          <Wind className="text-teal-400 w-6 h-6 animate-pulse" />
          <h3 className="text-xl font-semibold text-white">Box Breathing Oasis</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow py-4">
          {/* Breathing Circle */}
          <div className="relative flex items-center justify-center w-52 h-52">
            <div
              className={`absolute rounded-full transition-all duration-[4000ms] ease-in-out ${
                breathingActive
                  ? `${stages[breathingStage].color} ${stages[breathingStage].scale} ${stages[breathingStage].shadow}`
                  : "bg-slate-800 border-2 border-dashed border-slate-600 scale-100"
              } w-32 h-32 flex flex-col items-center justify-center text-center p-4`}
            >
              <span className="text-sm font-bold text-white transition-opacity duration-300">
                {breathingActive ? stages[breathingStage].text : "Ready"}
              </span>
              {breathingActive && (
                <span className="text-2xl font-black mt-1 text-white/90">
                  {breathingSeconds}s
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full text-center mt-4">
          <p className="text-xs text-slate-400 mb-4 px-4">
            Box breathing is used by elite performers to calm their nervous systems in high-stress situations. Follow the 4-second stages.
          </p>
          <button
            onClick={toggleBreathing}
            className={`w-full py-3 px-6 rounded-xl font-bold transition-all shadow-md ${
              breathingActive
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-teal-500 hover:bg-teal-400 text-slate-900"
            }`}
          >
            {breathingActive ? "Stop Exercise" : "Begin Box Breathing"}
          </button>
        </div>
      </div>

      {/* Pomodoro Focus & Affirmations Column */}
      <div className="space-y-6 flex flex-col justify-between">
        {/* Pomodoro Timer */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-indigo-400 w-6 h-6" />
              <h3 className="text-xl font-semibold text-white">Pomodoro Study Timer</h3>
            </div>
            {/* Mode toggles */}
            <div className="flex bg-slate-900/60 rounded-lg p-1 text-xs border border-slate-800">
              <button
                onClick={() => changePomoMode("study")}
                className={`py-1 px-3 rounded-md transition-all ${
                  pomoMode === "study"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Study
              </button>
              <button
                onClick={() => changePomoMode("break")}
                className={`py-1 px-3 rounded-md transition-all ${
                  pomoMode === "break"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Break
              </button>
            </div>
          </div>

          <div className="text-center py-6">
            <div className="text-6xl font-black font-mono text-white mb-6 tracking-wider select-none">
              {formatPomoTime(pomoSeconds)}
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePomoToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  pomoActive
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-indigo-500 hover:bg-indigo-400 text-white"
                }`}
              >
                {pomoActive ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Focus
                  </>
                )}
              </button>
              <button
                onClick={handlePomoReset}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl transition-all border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Affirmation Box */}
        <div className="glass-panel rounded-3xl p-6 flex-grow flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-yellow-400 w-5 h-5" />
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Mindful Affirmation</h4>
          </div>

          <div className="py-2 flex-grow flex items-center">
            <blockquote
              className={`text-lg italic font-medium text-slate-100 border-l-4 border-yellow-400/80 pl-4 py-1 transition-all duration-200 ${
                flip ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              }`}
            >
              &ldquo;{AFFIRMATIONS[affirmationIdx]}&rdquo;
            </blockquote>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={getNewAffirmation}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-yellow-400 py-2 px-4 rounded-xl border border-slate-700/60 transition-all active:scale-95"
            >
              New Affirmation ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
