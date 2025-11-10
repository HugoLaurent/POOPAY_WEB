export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "N/A";
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds)) return "N/A";
  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)} s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = Math.round(totalSeconds % 60);
  if (remaining === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remaining} s`;
}

export default {
  formatDuration,
};
