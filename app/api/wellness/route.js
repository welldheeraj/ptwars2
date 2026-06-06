import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY,
});

// OFFLINE FALLBACK
function offlineSupport(body) {
  const stress = Number(
    body.stress
  );
  const sleep = Number(
    body.sleep
  );
  const study = Number(
    body.studyHours
  );

  let tip = "";
  let motivation = "";
  let warning = "";

  if (stress >= 8) {
    tip =
      "High stress detected. Take short breaks and avoid overthinking.";

    warning =
      "High burnout risk detected.";
  } else if (stress >= 5) {
    tip =
      "Moderate stress detected. Focus on revision instead of overstudying.";
  } else {
    tip =
      "You are handling pressure well.";
  }

  if (sleep < 5) {
    warning +=
      " Sleep deficit detected.";
  }

  if (study > 10) {
    warning +=
      " Overstudying detected.";
  }

  const motivationMap =
    {
      NEET:
        "Consistency matters more than perfection.",
      JEE:
        "Every mock test is progress.",
      UPSC:
        "Discipline wins long journeys.",
      CAT:
        "Accuracy beats speed.",
      GATE:
        "Strong basics matter.",
      CUET:
        "Stay consistent daily.",
      Boards:
        "Revision builds confidence.",
    };

  motivation =
    motivationMap[
      body.exam
    ] ||
    "Believe in yourself.";

  return {
    tip,
    motivation,
    warning,
    mode: "offline",
  };
}

export async function POST(req) {
  try {
    const body =
      await req.json();

    try {
      if (
        process.env
          .OPENAI_API_KEY
      ) {
        console.log(
          "Using ChatGPT API..."
        );

        const completion =
          await openai.chat.completions.create(
            {
              model:
                "gpt-4.1-mini",

              messages: [
                {
                  role:
                    "system",

                  content:
                    "You are a mental wellness assistant for students preparing for NEET, JEE, UPSC, CAT, GATE, CUET, and Boards. Always return valid JSON only.",
                },
                {
                  role:
                    "user",

                  content: `
Student Details:

Exam:
${body.exam}

Mood:
${body.mood}

Stress Level:
${body.stress}/10

Sleep Hours:
${body.sleep}

Study Hours:
${body.studyHours}

Stress Trigger:
${body.trigger}

Reflection:
${body.reflection}

Return ONLY valid JSON:

{
"tip":"",
"motivation":"",
"warning":""
}
`,
                },
              ],

              temperature: 0.7,

              response_format:
                {
                  type:
                    "json_object",
                },
            }
          );

        const text =
          completion
            .choices[0]
            .message.content;

        console.log(
          "RAW OPENAI:",
          text
        );

        const parsed =
          JSON.parse(text);

        return Response.json({
          ...parsed,
          mode: "ai",
        });
      }
    } catch (aiError) {
      console.error(
        "OPENAI ERROR:",
        aiError.message
      );

      console.log(
        "Switching to offline mode..."
      );
    }

    // FALLBACK
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
          err.message,
      },
      {
        status: 500,
      }
    );
  }
}