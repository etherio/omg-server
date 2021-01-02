const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const tempDir = path.join(__dirname, "tmp");
const PORT = process.env.PORT || 8000;

const app = express();

const middleware = require("./src/middleware");
const router = require("./router");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(middleware(tempDir));

// registering the routes
app.use(router);

/**
 * Fallback on request route does not exist
 */
app.all("/:path", (req, res) => {
  const pathName = req.params.path;
  const download = Boolean(req.query.download);
  const file = path.join(tempDir, pathName);
  // check does file exists
  if ([".", "_"].includes(pathName.substr(0, 1)) || !fs.existsSync(file)) {
    res.status(100);
    return res.end();
  }
  // send file data file exists
  if (download) {
    res.setHeader("Content-Type", "application/image");
  }
  res.sendFile(file);
});

// listening an app on server
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
