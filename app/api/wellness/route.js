import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// OFFLINE FALLBACK
function offlineSupport(body) {
  const stress = Number(body.stress);
  const sleep = Number(body.sleep);
  const study = Number(body.studyHours);

  let tip = "";
  let motivation = "";
  let warning = "";
  let affirmation = "";

  if (stress >= 8) {
    tip = "High stress detected. Take short breaks and practice deep breathing.";
    warning = "High burnout risk! Please limit continuous study hours.";
    affirmation = "My worth is not defined by any exam. I am doing my best.";
  } else if (stress >= 5) {
    tip = "Moderate stress detected. Balance your mock test revisions with light exercise.";
    warning = "Watch out for stress accumulation.";
    affirmation = "Step by step, day by day, I am moving forward.";
  } else {
    tip = "You are handling pressure well. Keep up the balanced routine.";
    warning = "";
    affirmation = "I am calm, focused, and ready to learn.";
  }

  if (sleep < 6) {
    warning += " Sleep deficit detected. Aim for at least 7 hours of rest.";
  }

  if (study > 10) {
    warning += " Excessive study hours. Take regular breaks to maintain focus.";
  }

  const motivationMap = {
    NEET: "Focus on conceptual clarity and consistency. biology diagrams and physics formulas will fall into place.",
    JEE: "Every problem solved is a step closer. Trust your practice and speed.",
    UPSC: "This is a marathon, not a sprint. Consistency and mindset win the race.",
    CAT: "Accuracy and time management are key. Trust your mock analysis.",
    GATE: "Basics are your foundation. Keep practicing core concepts.",
    CUET: "Stay consistent and read carefully. You are well-prepared.",
    Boards: "Focus on structured answers and revisions. You've got this."
  };

  motivation = motivationMap[body.exam] || "Believe in your preparation and take it one day at a time.";

  return {
    tip,
    motivation,
    warning,
    affirmation,
    mode: "offline",
  };
}

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("Attempting Gemini API...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are a compassionate student mental wellness assistant. 
Review this student's status preparing for the ${body.exam} exam:
- Mood: ${body.mood}
- Stress Level: ${body.stress}/10
- Sleep Hours: ${body.sleep} hours
- Study Hours: ${body.studyHours} hours
- Stress Trigger: ${body.trigger}
- Reflection: "${body.reflection}"

Output a JSON object with this exact structure:
{
  "tip": "A short, actionable tip for stress relief based on their inputs",
  "motivation": "Personalized exam-specific word of motivation",
  "warning": "Gentle warnings if you detect signs of burnout, sleep deficit, or exam panic, otherwise empty string",
  "affirmation": "A soothing positive affirmation for the student"
}`;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        console.log("Gemini API Response:", text);
        const parsed = JSON.parse(text);
        return Response.json({
          ...parsed,
          mode: "gemini"
        });
      } catch (geminiError) {
        console.error("Gemini API error, falling back to OpenAI:", geminiError.message);
      }
    }

    // 2. Try OpenAI Fallback
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("Attempting OpenAI API...");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a mental wellness assistant for students preparing for competitive exams. Return valid JSON only.",
            },
            {
              role: "user",
              content: `Student details:
Exam: ${body.exam}
Mood: ${body.mood}
Stress Level: ${body.stress}/10
Sleep Hours: ${body.sleep}
Study Hours: ${body.studyHours}
Stress Trigger: ${body.trigger}
Reflection: ${body.reflection}

Return ONLY valid JSON:
{
  "tip": "...",
  "motivation": "...",
  "warning": "...",
  "affirmation": "..."
}`
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        const text = completion.choices[0].message.content;
        console.log("OpenAI API Response:", text);
        const parsed = JSON.parse(text);
        return Response.json({
          ...parsed,
          mode: "openai"
        });
      } catch (openaiError) {
        console.error("OpenAI API error, falling back to Offline mode:", openaiError.message);
      }
    }

    // 3. Try Offline Fallback
    console.log("Using Offline Support Fallback...");
    return Response.json(offlineSupport(body));

  } catch (error) {
    console.error("Server API Error:", error);
    return Response.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}