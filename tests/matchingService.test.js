const test = require("node:test");
const assert = require("node:assert/strict");
const { scoreCompatibility, overlapRatio } = require("../src/utils/matchingService");

test("overlapRatio is case-insensitive and avoids duplicate inflation", () => {
  assert.equal(overlapRatio(["Java", "java", "Node"], ["JAVA", "Python"]), 1 / 3);
});

test("complementary skills and shared goals produce an explainable match", () => {
  const result = scoreCompatibility(
    {
      skills: ["Node.js"],
      skillsWanted: ["React"],
      lookingFor: ["hackathon-team"],
      availability: "weekends",
      preferredProjects: ["developer-tools"],
    },
    {
      skills: ["React"],
      skillsWanted: ["Node.js"],
      lookingFor: ["hackathon-team"],
      availability: "weekends",
      preferredProjects: ["developer-tools"],
    }
  );

  assert.equal(result.compatibilityScore, 100);
  assert.ok(result.matchReasons.some((reason) => reason.includes("complement")));
  assert.ok(result.matchReasons.some((reason) => reason.includes("availability")));
});

test("empty profiles receive a zero score and fallback reason", () => {
  const result = scoreCompatibility({}, {});
  assert.equal(result.compatibilityScore, 0);
  assert.deepEqual(result.matchReasons, ["A new connection to explore."]);
});
