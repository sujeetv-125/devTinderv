
const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, age } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password not valid");
  } else if (!validator.isInt(String(age), { min: 1 })) {
    throw new Error("Age not valid");
  }
};
const validateEditProfileData = (req) => {
  const allowedEditFields = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "about",
  "skills",
];
const isEditAllowed = Object.keys(req.body).every((field)=>
  allowedEditFields.includes(field)
);
return isEditAllowed;
};



module.exports = { validateSignUpData,validateEditProfileData, };
