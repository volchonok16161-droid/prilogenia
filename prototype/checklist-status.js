/**
 * Shared status rules for cloud checklist rows in the account dashboard.
 * A checklist is complete only when the authoritative saved progress is 100%.
 * Missing/legacy stats stay "in progress" rather than being guessed as complete.
 */
export function isChecklistComplete(stats) {
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) return false;
  const percent = Number(stats.completionPercent);
  if (!Number.isFinite(percent) || percent !== 100) return false;

  const total = Number(stats.totalFields ?? stats.total);
  const filled = Number(stats.filledTotal ?? stats.answered);
  if (!Number.isSafeInteger(total) || total <= 0 ||
      !Number.isSafeInteger(filled) || filled !== total) return false;
  return true;
}

export function summarizeChecklistStatuses(rows) {
  const checklists = Array.isArray(rows) ? rows : [];
  const completed = checklists.reduce(
    (count, row) => count + (isChecklistComplete(row?.stats) ? 1 : 0),
    0,
  );
  return Object.freeze({
    total: checklists.length,
    completed,
    inProgress: checklists.length - completed,
  });
}
