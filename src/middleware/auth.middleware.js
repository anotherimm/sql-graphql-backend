const jwt = require("jsonwebtoken");
require("dotenv").config();

// middleware untuk authentikasi token JWT
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1]; // Format: Bearer <token>
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.user = {
    id: decodedToken.id,
    username: decodedToken.username,
    role: decodedToken.role,
    kode_unit: decodedToken.kode_unit,
  };
  next();
};
