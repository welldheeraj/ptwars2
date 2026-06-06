"use client";

import { useEffect, useState } from "react";
import ProgressChart from "./components/ProgressChart";
import toast, {
  Toaster,
} from "react-hot-toast";
import { calculateWellnessScore } from "./utils/scoreEngine";
import { detectBurnout } from "./utils/triggerEngine";

export default function Home() {
  const [loading, setLoading] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [burnout, setBurnout] =
    useState(null);

  const [aiResult, setAiResult] =
    useState(null);
const [history, setHistory] =
  useState([]);
  const [errors, setErrors] =
    useState({});

  const [form, setForm] =
    useState({
      exam: "",
      mood: "",
      stress: "",
      sleep: "",
      studyHours: "",
      trigger: "",
      reflection: "",
    });

  // Load local storage
  useEffect(() => {
    const saved =
      localStorage.getItem(
        "mentalTracker"
      );

    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
  const savedHistory =
    JSON.parse(
      localStorage.getItem(
        "wellnessHistory"
      )
    ) || [];

  setHistory(savedHistory);
}, []);
  // Save local storage
  useEffect(() => {
    localStorage.setItem(
      "mentalTracker",
      JSON.stringify(form)
    );
  }, [form]);

  const handleChange = (
    e
  ) => {
    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove field error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.exam.trim()) {
      newErrors.exam =
        "Exam type is required";
    }

    if (!form.mood.trim()) {
      newErrors.mood =
        "Mood is required";
    }

    if (
      !form.stress ||
      Number(form.stress) <
        1 ||
      Number(form.stress) >
        10
    ) {
      newErrors.stress =
        "Stress level must be between 1–10";
    }

    if (
      !form.sleep ||
      Number(form.sleep) <
        1 ||
      Number(form.sleep) >
        24
    ) {
      newErrors.sleep =
        "Sleep hours must be between 1–24";
    }

    if (
      !form.studyHours ||
      Number(
        form.studyHours
      ) < 0 ||
      Number(
        form.studyHours
      ) > 18
    ) {
      newErrors.studyHours =
        "Study hours must be between 0–18";
    }

    if (
      !form.trigger.trim()
    ) {
      newErrors.trigger =
        "Stress trigger is required";
    }

    if (
      !form.reflection.trim()
    ) {
      newErrors.reflection =
        "Reflection journal is required";
    }

    setErrors(newErrors);

    if (
      Object.keys(
        newErrors
      ).length > 0
    ) {
      toast.error(
        "Please fix form errors"
      );
      return false;
    }

    return true;
  };

  const handleSubmit =
    async () => {
      const isValid =
        validate();

      // STOP API CALL
      if (!isValid)
        return;

      try {
        setLoading(true);

        // wellness score
        const scoreResult =
          calculateWellnessScore(
            {
              mood:
                form.mood,
              sleep:
                Number(
                  form.sleep
                ),
              studyHours:
                Number(
                  form.studyHours
                ),
              stress:
                Number(
                  form.stress
                ),
            }
          );

        setScore(
          scoreResult
        );

        // burnout
        const burnoutData =
          detectBurnout({
            stress:
              Number(
                form.stress
              ),
            sleep:
              Number(
                form.sleep
              ),
            studyHours:
              Number(
                form.studyHours
              ),
          });

        setBurnout(
          burnoutData
        );

        const res =
          await fetch(
            "/api/wellness",
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  form
                ),
            }
          );

        if (!res.ok) {
          throw new Error(
            "Failed to generate report"
          );
        }

        const data =
          await res.json();

        setAiResult(data);

        toast.success(
          "Wellness report generated"
        );
      } catch (error) {
        toast.error(
          error.message
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
            🧠 Mental Wellness
            Tracker
          </h1>

          <p className="text-gray-500 mt-2">
            Support during
            exams and result
            season
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* FORM */}

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">
              Daily Check-In
            </h2>

            <div className="space-y-4">

              {/* Exam */}

              <div>
                <select
                  name="exam"
                  value={
                    form.exam
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
                >
                  <option value="">
                    Select Exam
                  </option>

                  <option>
                    NEET
                  </option>
                  <option>
                    JEE
                  </option>
                  <option>
                    UPSC
                  </option>
                  <option>
                    CAT
                  </option>
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

                {errors.exam && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors.exam
                    }
                  </p>
                )}
              </div>

              {/* Mood */}

              <div>
                <select
                  name="mood"
                  value={
                    form.mood
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
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
                    Anxiety
                  </option>
                  <option>
                    Burnout
                  </option>
                </select>

                {errors.mood && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors.mood
                    }
                  </p>
                )}
              </div>

              {/* Stress */}

              <div>
                <input
                  type="number"
                  name="stress"
                  placeholder="Stress Level (1-10)"
                  value={
                    form.stress
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
                />

                {errors.stress && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors.stress
                    }
                  </p>
                )}
              </div>

              {/* Sleep */}

              <div>
                <input
                  type="number"
                  name="sleep"
                  placeholder="Sleep Hours"
                  value={
                    form.sleep
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
                />

                {errors.sleep && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors.sleep
                    }
                  </p>
                )}
              </div>

              {/* Study Hours */}

              <div>
                <input
                  type="number"
                  name="studyHours"
                  placeholder="Study Hours"
                  value={
                    form.studyHours
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
                />

                {errors.studyHours && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors.studyHours
                    }
                  </p>
                )}
              </div>

              {/* Trigger */}

              <div>
                <select
                  name="trigger"
                  value={
                    form.trigger
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
                >
                  <option value="">
                    Select Stress Trigger
                  </option>

                  <option>
                    Exam Pressure
                  </option>

                  <option>
                    Fear of Failure
                  </option>

                  <option>
                    Low Mock Test Score
                  </option>

                  <option>
                    Parents Pressure
                  </option>

                  <option>
                    Result Anxiety
                  </option>

                  <option>
                    Sleep Issues
                  </option>

                  <option>
                    Time Management
                  </option>

                  <option>
                    Self Doubt
                  </option>
                </select>

                {errors.trigger && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors.trigger
                    }
                  </p>
                )}
              </div>

              {/* Reflection */}

              <div>
                <textarea
                  rows={4}
                  name="reflection"
                  placeholder="How are you feeling today?"
                  value={
                    form
                      .reflection
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border rounded-xl p-4"
                />

                {errors.reflection && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors
                        .reflection
                    }
                  </p>
                )}
              </div>

              <button
                onClick={
                  handleSubmit
                }
                disabled={
                  loading
                }
                className="w-full bg-black text-white rounded-xl p-4 font-bold hover:opacity-90"
              >
                {loading
                  ? "Generating..."
                  : "Generate Wellness Report"}
              </button>
            </div>
          </div>

          {/* RESULT */}

          <div className="space-y-5">

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold">
                Wellness Score
              </h2>

              <h1 className="text-5xl font-bold mt-3">
                {score}/100
              </h1>
            </div>

            {burnout && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="font-bold text-xl">
                  Burnout Risk
                </h2>

                <p>
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
              <div className="bg-white rounded-3xl shadow-lg p-6">

                <h2 className="text-2xl font-bold mb-4">
                  Personalized
                  Support
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

                <p className="text-sm text-gray-500 mt-4">
                  Mode:
                  {aiResult.mode ===
                  "ai"
                    ? " 🤖 AI Powered"
                    : " ⚡ Smart Offline"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}