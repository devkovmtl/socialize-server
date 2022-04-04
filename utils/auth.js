const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// generate a token from payload
exports.generateJwtToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  const options = {
    expiresIn: '1d',
  };
  return jwt.sign(payload, JWT_SECRET, options);
};
