const fallbackFormat = (value) => {
  if (!value) return "";
  return value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const CHALLENGE_STATUS_LABELS = {
  todo: "Upcoming",
  in_progress: "Ongoing",
  done: "Completed",
};

const GOAL_STATUS_LABELS = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export const formatChallengeStatus = (value) =>
  CHALLENGE_STATUS_LABELS[value] ?? fallbackFormat(value);

export const formatGoalStatus = (value) =>
  GOAL_STATUS_LABELS[value] ?? fallbackFormat(value);
