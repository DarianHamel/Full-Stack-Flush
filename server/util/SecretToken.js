// for hashing all user passwords in our database
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.createSecretToken = (id) => {
  const secret = process.env.SECRET || 'default_secret';
  return jwt.sign({ id }, secret, { expiresIn: 3 * 24 * 60 * 60 });
};