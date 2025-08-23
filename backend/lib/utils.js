const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET; // Use env var in production
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN; 

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function signUserToken(user) {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return { payload: payload, token: jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }) };
}

function verifyUserToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  signUserToken,
  verifyUserToken,
  hashPassword,
  comparePassword,
};