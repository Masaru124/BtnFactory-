module.exports = function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.sendStatus(403);
    }
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.sendStatus(403);
    }
    next();
  };
};
