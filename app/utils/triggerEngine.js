export const detectBurnout = ({
  stress,
  sleep,
  studyHours,
}) => {
  if (
    stress > 7 &&
    sleep < 5 &&
    studyHours > 10
  ) {
    return {
      risk: "High",
      message:
        "High burnout risk detected",
    };
  }

  return {
    risk: "Low",
    message:
      "You are doing okay",
  };
};