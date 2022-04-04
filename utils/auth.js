const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// grab some info from user object to put in token or on the request object
const userTokenInfo = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

// generate a token from payload
const generateJwtToken = (user) => {
  const payload = userTokenInfo(user);
  const options = {
    expiresIn: '24h',
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

module.exports = { userTokenInfo, generateJwtToken };
