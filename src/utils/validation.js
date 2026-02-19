const { isStrongPassword } = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");

const useValidation = (res) => {
  const { firstName, lastName, email, password } = res.body;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required");
  } else if (firstName.length < 4 || firstName.length > 20) {
    throw new Error("First name must be between 6 and 20 characters");
  } else if (lastName.length < 3 || lastName.length > 20) {
    throw new Error("Last name must be between 3 and 20 characters");
  } else if (!isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!isStrongPassword(password)) {
    throw new Error("Password must be strong");
  }
};

module.exports = useValidation;
