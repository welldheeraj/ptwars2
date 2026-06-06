"use client";

import { useState, useEffect } from "react";
import { Brain, Moon, BookOpen, HeartPulse } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { calculateWellnessScore } from "./utils/scoreEngine";
import { detectBurnout } from "./utils/triggerEngine";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [form, setForm] = useState({
    exam: "",
    mood: "",
    stress: "",
    sleep: "",
    studyHours: "",
    trigger: "",
    reflection: "",
  });

  const [score, setScore] = useState(0);
  const [burnout, setBurnout] = useState(null);

  useEffect(() => {
    const saved =
      localStorage.getItem("mentalTracker");

    if (saved) {
      const parsed = JSON.parse(saved);
      setForm(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "mentalTracker",
      JSON.stringify(form)
    );
  }, [form]);

  const validate = () => {
    if (!form.exam)
      return toast.error(
        "Select exam type"
      );

    if (!form.mood)
      return toast.error(
        "Select mood"
      );

    if (!form.stress)
      return toast.error(
        "Stress level required"
      );

    if (!form.sleep)
      return toast.error(
        "Sleep hours required"
      );

    if (!form.studyHours)
      return toast.error(
        "Study hours required"
      );

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const wellnessScore =
        calculateWellnessScore({
          mood: form.mood,
          sleep: Number(form.sleep),
          studyHours:
            Number(form.studyHours),
          stress:
            Number(form.stress),
        });

      setScore(wellnessScore);

      const burnoutResult =
        detectBurnout({
          stress:
            Number(form.stress),
          sleep:
            Number(form.sleep),
          studyHours:
            Number(
              form.studyHours
            ),
        });

      setBurnout(burnoutResult);

      const res = await fetch(
        "/api/wellness",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            form
          ),
        }
      );

      const data =
        await res.json();
console.log(data);
      setAiResult(data);

      toast.success(
        "Wellness report generated"
      );
    } catch (err) {
      toast.error(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <Toaster />

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold">
            🧠 Mental Wellness Tracker
          </h1>

          <p className="text-gray-600 mt-2">
            Support for NEET,
            JEE, UPSC, CAT,
            CUET, Boards &
            More
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* FORM */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <h2 className="text-2xl font-bold mb-5">
              Daily Check-In
            </h2>

            <div className="space-y-4">

              <select
                className="w-full border rounded-xl p-4"
                value={form.exam}
                onChange={(e) =>
                  setForm({
                    ...form,
                    exam:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Exam
                </option>

                <option>
                  NEET
                </option>
                <option>JEE</option>
                <option>
                  UPSC
                </option>
                <option>CAT</option>
                <option>
                  GATE
                </option>
                <option>
                  CUET
                </option>
                <option>
                  Boards
                </option>
              </select>

              <select
                className="w-full border rounded-xl p-4"
                value={form.mood}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mood:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Mood
                </option>

                <option>
                  Happy
                </option>
                <option>
                  Okay
                </option>
                <option>
                  Stressed
                </option>
                <option>
                  Burnout
                </option>
                <option>
                  Anxiety
                </option>
              </select>

              <input
                type="number"
                placeholder="Stress Level (1-10)"
                className="w-full border rounded-xl p-4"
                value={
                  form.stress
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    stress:
                      e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Sleep Hours"
                className="w-full border rounded-xl p-4"
                value={
                  form.sleep
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    sleep:
                      e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Study Hours"
                className="w-full border rounded-xl p-4"
                value={
                  form.studyHours
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    studyHours:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Stress Trigger"
                className="w-full border rounded-xl p-4"
                value={
                  form.trigger
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    trigger:
                      e.target.value,
                  })
                }
              />

              <textarea
                rows={4}
                placeholder="Reflection Journal"
                className="w-full border rounded-xl p-4"
                value={
                  form.reflection
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    reflection:
                      e.target.value,
                  })
                }
              />

              <button
                onClick={
                  handleSubmit
                }
                className="w-full bg-black text-white rounded-xl p-4 font-bold"
              >
                {loading
                  ? "Generating..."
                  : "Generate Wellness Report"}
              </button>
            </div>
          </div>

          {/* RESULT */}

          <div className="space-y-5">

            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-bold">
                Wellness Score
              </h2>

              <div className="text-5xl font-bold mt-3">
                {score}/100
              </div>
            </div>

            {burnout && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="font-bold text-xl">
                  Burnout Risk
                </h2>

                <p className="mt-2">
                  Risk:
                  <strong>
                    {" "}
                    {
                      burnout.risk
                    }
                  </strong>
                </p>

                <p>
                  {
                    burnout.message
                  }
                </p>
              </div>
            )}

            {aiResult && (
              <div className="bg-white rounded-3xl shadow-xl p-6">

                <h2 className="text-2xl font-bold mb-4">
                  Personalized Support
                </h2>

                <p className="mb-4">
                  💡{" "}
                  {
                    aiResult.tip
                  }
                </p>

                <p className="mb-4">
                  ❤️{" "}
                  {
                    aiResult
                      .motivation
                  }
                </p>

                <p>
                  ⚠️{" "}
                  {
                    aiResult
                      .warning
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}