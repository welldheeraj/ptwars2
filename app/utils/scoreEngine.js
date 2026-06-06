export const calculateWellnessScore = ({
  mood,
  sleep,
  studyHours,
  stress,
}) => {
  let score = 100;

  score -= stress * 5;
  score += sleep * 2;

  if (studyHours > 10)
    score -= 15;

  if (mood === "Stressed")
    score -= 20;

  if (mood === "Happy")
    score += 10;

  return Math.max(
    0,
    Math.min(100, score)
  );
};