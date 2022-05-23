const {UnauthenticatedError } = require("../errors");

const verifyAdmin = async (req, res, next) => {
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      throw new UnauthenticatedError(
        "Only administrators can use this route...!!!"
      );
    }
    next();
  };
module.exports = verifyAdmin;