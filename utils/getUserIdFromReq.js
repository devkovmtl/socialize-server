const jwt = require('jsonwebtoken');

exports.getUserIdFromReq = (req) => {
  let userId = null;

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token);
    userId = decoded.id;
  }

  return userId;
};
