const fs = require("fs");
const path = require("path");
/* 30 minutes */
const maxAge = 30 * 60 * 1000;

module.exports = (dirname) => {
  const cachedFile = path.resolve(dirname, ".timestamp");

  if (!fs.existsSync(cachedFile)) {
    fs.writeFileSync(cachedFile, Date.now().toString(), "utf-8");
  }

  const startTime = parseInt(fs.readFileSync(cachedFile));
  const expired = startTime + maxAge;

  return (req, res, next) => {
    res.setHeader("X-Expired-Time", new Date(expired).toUTCString());
    res.startTime = req.startTime = startTime;
    res.expiredOn = req.expiredOn = Date.now() + maxAge;
    return next();
  };
};
