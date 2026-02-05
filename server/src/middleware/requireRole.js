const requireRole = (role) => (req, res, next) => {
  const adminPasscode = req.headers["x-admin-passcode"];
  const VALID_PASSCODE = "friends129";

  // Allow if user has the role OR if they provide the valid admin passcode
  if ((req.user && req.user.role === role) || (adminPasscode === VALID_PASSCODE)) {
    return next();
  }

  return res.status(403).json({ message: "Forbidden" });
};

module.exports = requireRole;
