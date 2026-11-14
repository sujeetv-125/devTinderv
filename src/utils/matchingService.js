function normalize(values = []) {
  return [...new Set(values.map((value) => String(value).trim().toLowerCase()).filter(Boolean))];
}

function overlapRatio(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (a.length === 0 || b.length === 0) return 0;
  const rightSet = new Set(b);
  const intersection = a.filter((value) => rightSet.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function scoreCompatibility(currentUser, candidate) {
  const currentSkills = normalize(currentUser.skills);
  const candidateSkills = normalize(candidate.skills);
  const sharedSkillScore = overlapRatio(currentSkills, candidateSkills);

  const currentWanted = normalize(currentUser.skillsWanted);
  const candidateWanted = normalize(candidate.skillsWanted);
  const wantedByCurrent = currentWanted.filter((skill) => candidateSkills.includes(skill));
  const wantedByCandidate = candidateWanted.filter((skill) => currentSkills.includes(skill));
  const wantedCount = currentWanted.length + candidateWanted.length;
  const complementarySkillScore = wantedCount === 0
    ? 0
    : (wantedByCurrent.length + wantedByCandidate.length) / wantedCount;

  const skillScore = Math.max(sharedSkillScore, complementarySkillScore);
  const goalScore = overlapRatio(currentUser.lookingFor, candidate.lookingFor);
  const availabilityScore = currentUser.availability && currentUser.availability === candidate.availability ? 1 : 0;
  const projectScore = overlapRatio(currentUser.preferredProjects, candidate.preferredProjects);

  const compatibilityScore = Math.round(
    skillScore * 40 + goalScore * 35 + availabilityScore * 15 + projectScore * 10
  );

  const matchReasons = [];
  if (sharedSkillScore > 0) matchReasons.push("You share technical skills.");
  if (complementarySkillScore > 0) matchReasons.push("Your skills complement each other's goals.");
  if (goalScore > 0) matchReasons.push("You have overlapping collaboration goals.");
  if (availabilityScore > 0) matchReasons.push("Your availability matches.");
  if (projectScore > 0) matchReasons.push("You are interested in similar project areas.");
  if (matchReasons.length === 0) matchReasons.push("A new connection to explore.");

  return { compatibilityScore, matchReasons };
}

module.exports = { scoreCompatibility, overlapRatio };
