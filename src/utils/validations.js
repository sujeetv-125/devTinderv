const validator = require("validator");

const PROFILE_FIELDS = [
  "firstName", "lastName", "photoUrl", "about", "skills", "skillsWanted",
  "lookingFor", "availability", "preferredProjects",
];
const COLLABORATION_GOALS = [
  "hackathon-team", "project-collaborator", "open-source",
  "learning-partner", "mentor", "mentee",
];
const AVAILABILITY_OPTIONS = ["weekdays", "weekends", "evenings", "flexible"];

function validateSignUpData(body = {}) {
  const { firstName, lastName = "", emailId, password } = body;
  if (typeof firstName !== "string" || firstName.trim().length < 2) {
    throw new Error("First name must contain at least 2 characters.");
  }
  if (typeof lastName !== "string" || lastName.length > 50) {
    throw new Error("Last name must be a string of at most 50 characters.");
  }
  if (typeof emailId !== "string" || !validator.isEmail(emailId)) {
    throw new Error("Enter a valid email address.");
  }
  if (typeof password !== "string" || !validator.isStrongPassword(password)) {
    throw new Error("Password must be strong (at least 8 characters with mixed character types).");
  }
}

function validateProfileUpdates(body = {}) {
  const keys = Object.keys(body);
  if (keys.length === 0) throw new Error("Provide at least one profile field to update.");

  for (const key of keys) {
    if (!PROFILE_FIELDS.includes(key)) throw new Error("Profile field cannot be updated: " + key);
  }
  if (body.firstName !== undefined &&
      (typeof body.firstName !== "string" || body.firstName.trim().length < 2)) {
    throw new Error("First name must contain at least 2 characters.");
  }
  if (body.lastName !== undefined &&
      (typeof body.lastName !== "string" || body.lastName.length > 50)) {
    throw new Error("Last name must be a string of at most 50 characters.");
  }
  if (body.photoUrl !== undefined &&
      (typeof body.photoUrl !== "string" ||
       !validator.isURL(body.photoUrl, { protocols: ["http", "https"], require_protocol: true }))) {
    throw new Error("Photo URL must be a valid HTTP or HTTPS URL.");
  }
  if (body.about !== undefined &&
      (typeof body.about !== "string" || body.about.length > 500)) {
    throw new Error("About must be a string of at most 500 characters.");
  }

  for (const field of ["skills", "skillsWanted", "preferredProjects"]) {
    if (body[field] !== undefined &&
        (!Array.isArray(body[field]) || body[field].length > 20 ||
         body[field].some((value) => typeof value !== "string" || !value.trim() || value.length > 40))) {
      throw new Error(field + " must be an array of up to 20 non-empty strings (40 characters max).");
    }
  }

  if (body.lookingFor !== undefined &&
      (!Array.isArray(body.lookingFor) || body.lookingFor.length > 6 ||
       body.lookingFor.some((goal) => !COLLABORATION_GOALS.includes(goal)))) {
    throw new Error("lookingFor contains an unsupported collaboration goal.");
  }
  if (body.availability !== undefined && !AVAILABILITY_OPTIONS.includes(body.availability)) {
    throw new Error("Choose a supported availability option.");
  }
  return true;
}

module.exports = { validateSignUpData, validateProfileUpdates, PROFILE_FIELDS };
