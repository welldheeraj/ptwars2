import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);
console.log(
    "KEY EXISTS:",
    !!process.env.GEMINI_API_KEY
  );

  console.log(
    "KEY PREVIEW:",
    process.env.GEMINI_API_KEY?.slice(
      0,
      10
    )
  );
// OFFLINE FALLBACK ENGINE
function offlineSupport(body) {
  const stress = Number(body.stress);
  const sleep = Number(body.sleep);
  const study = Number(body.studyHours);

  let tip = "";
  let motivation = "";
  let warning = "";

  // Stress Analysis
  if (stress >= 8) {
    tip =
      "High stress detected. Reduce pressure by taking 15-minute breaks and avoiding overthinking.";

    warning =
      "High burnout risk detected.";
  } else if (stress >= 5) {
    tip =
      "Moderate stress detected. Focus on revision instead of learning too many new topics.";

    warning =
      "Manage your stress with breathing exercises.";
  } else {
    tip =
      "You are handling pressure well. Keep your routine consistent.";
  }

  // Sleep Logic
  if (sleep < 5) {
    warning +=
      " Sleep deficit detected. Your mental focus may decrease.";
  }

  // Overstudy Logic
  if (study > 10) {
    warning +=
      " Overstudying detected. Productivity may drop.";
  }

  // Exam Specific Motivation
  const motivationMap = {
    NEET:
      "Consistency matters more than perfection. Focus on concepts.",
    JEE:
      "Every mock test is progress, not failure.",
    UPSC:
      "Small disciplined efforts create big success.",
    CAT:
      "Accuracy matters more than speed.",
    GATE:
      "Strong fundamentals beat shortcuts.",
    CUET:
      "Stay consistent and revise regularly.",
    Boards:
      "Revision and confidence will help you succeed.",
  };

  motivation =
    motivationMap[body.exam] ||
    "Believe in yourself and stay consistent.";

  return {
    tip,
    motivation,
    warning,
    mode: "offline",
  };
}

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    // VALIDATION
    if (
      !body.exam ||
      !body.mood ||
      !body.stress ||
      !body.sleep ||
      !body.studyHours
    ) {
      return Response.json(
        {
          error:
            "Missing required fields",
        },
        { status: 400 }
      );
    }

    // TRY GEMINI FIRST
    try {
      if (
        process.env.GEMINI_API_KEY
      ) {
        console.log(
          "Using Gemini API..."
        );

        const model =
          genAI.getGenerativeModel(
            {
              model: "gemini-2.0-flash",
            }
          );

        const prompt = `
You are a mental wellness assistant helping students during exams.

Student Details:
Exam: ${body.exam}
Mood: ${body.mood}
Stress Level: ${body.stress}/10
Sleep Hours: ${body.sleep}
Study Hours: ${body.studyHours}
Stress Trigger: ${body.trigger}
Reflection Journal: ${body.reflection}

Analyze emotional state and provide personalized support.

Return ONLY valid JSON in this format:

{
  "tip": "",
  "motivation": "",
  "warning": ""
}
`;

        const result =
          await model.generateContent(
            prompt
          );

        let text =
          result.response.text();

        console.log(
          "RAW GEMINI:",
          text
        );

        // CLEAN RESPONSE
        text = text
          .replace(
            /```json/g,
            ""
          )
          .replace(
            /```/g,
            ""
          )
          .trim();

        const firstBrace =
          text.indexOf("{");

        const lastBrace =
          text.lastIndexOf(
            "}"
          );

        // INVALID JSON => FALLBACK
        if (
          firstBrace === -1 ||
          lastBrace === -1
        ) {
          throw new Error(
            "Invalid Gemini JSON"
          );
        }

        const cleanJson =
          text.slice(
            firstBrace,
            lastBrace + 1
          );

        const parsed =
          JSON.parse(
            cleanJson
          );
console.log(parsed);
        return Response.json({
          ...parsed,
          mode: "ai",
        });
      }
    } catch (aiError) {
      console.error(
        "AI ERROR:",
        aiError.message
      );

      console.log(
        "Switching to offline mode..."
      );
    }

    // FALLBACK MODE
    return Response.json(
      offlineSupport(body)
    );
  } catch (err) {
    console.error(
      "SERVER ERROR:",
      err
    );

    return Response.json(
      {
        error:
          err.message ||
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}