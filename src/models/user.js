const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const COLLABORATION_GOALS = [
  "hackathon-team", "project-collaborator", "open-source",
  "learning-partner", "mentor", "mentee",
];
const AVAILABILITY_OPTIONS = ["weekdays", "weekends", "evenings", "flexible"];

const stringList = {
  type: [{ type: String, trim: true, maxlength: 40 }],
  default: [],
  validate: {
    validator: (values) => values.length <= 20,
    message: "A list cannot contain more than 20 items.",
  },
};

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50, default: "" },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      maxlength: 254,
      validate: { validator: (value) => validator.isEmail(value), message: "Enter a valid email address." },
    },
    password: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, select: false },
    photoUrl: {
      type: String,
      default: "https://placehold.co/240x240?text=Developer",
      validate: {
        validator: (value) => !value || validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }),
        message: "Photo URL must be a valid HTTP or HTTPS URL.",
      },
    },
    about: { type: String, trim: true, maxlength: 500, default: "Building, learning, and looking for good people to build with." },
    skills: stringList,
    skillsWanted: stringList,
    lookingFor: {
      type: [{ type: String, enum: COLLABORATION_GOALS }],
      default: [],
      validate: { validator: (values) => values.length <= 6, message: "Choose no more than 6 collaboration goals." },
    },
    availability: { type: String, enum: AVAILABILITY_OPTIONS, default: "flexible" },
    preferredProjects: stringList,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.getJWT = function getJWT() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ sub: this._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "devbridge-api",
  });
};

userSchema.methods.validatePassword = function validatePassword(inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
