const test = require("node:test");
const assert = require("node:assert/strict");
const { validateSignUpData, validateProfileUpdates } = require("../src/utils/validations");

test("signup validation accepts a valid account payload", () => {
  assert.doesNotThrow(() => validateSignUpData({
    firstName: "Aarav",
    lastName: "Sharma",
    emailId: "aarav@example.com",
    password: "Use-A-Strong-Password-123!",
  }));
});

test("signup validation rejects invalid email addresses", () => {
  assert.throws(() => validateSignUpData({
    firstName: "Aarav",
    lastName: "Sharma",
    emailId: "not-an-email",
    password: "Use-A-Strong-Password-123!",
  }), /valid email/i);
});

test("profile updates reject protected fields", () => {
  assert.throws(
    () => validateProfileUpdates({ emailId: "changed@example.com" }),
    /cannot be updated/i
  );
});

test("profile updates accept valid collaboration preferences", () => {
  assert.doesNotThrow(() => validateProfileUpdates({
    skills: ["Java", "Node.js"],
    skillsWanted: ["React"],
    lookingFor: ["hackathon-team"],
    availability: "weekends",
  }));
});
