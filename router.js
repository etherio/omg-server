const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const jimp = require("jimp");

const IMAGE_WIDTH = jimp.AUTO;
const IMAGE_HEIGHT = 480;

const MIME_TYPE_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/svg": "svg",
};

const router = Router();

const upload = multer({
  dest: path.resolve(__dirname, "tmp"),
});

router.post("/image", upload.single("image"), async (req, res) => {
  let ext =
    req.file && req.file.mimetype && MIME_TYPE_EXTENSION[req.file.mimetype];
  let code = req.body.code;

  if (!req.file || !ext) {
    let errors = [];
    if (!req.file) errors.push("Required to upload an image");
    if (!ext) errors.push("Unsupported image type");
    res.json({ errors });
    res.status(400);
    return res.end();
  }
  try {
    let { filename, path, destination } = req.file;
    let fileName = `${Date.now()}-${filename}.${ext}`;
    let output = `${destination}/${fileName}`;
    // let protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    let image = await jimp.read(path);
    let { height, width } = image.bitmap;
    let white = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
    let black = await jimp.loadFont(jimp.FONT_SANS_16_BLACK);
    if (
      (IMAGE_HEIGHT != jimp.AUTO && height > IMAGE_HEIGHT) ||
      (IMAGE_WIDTH != jimp.AUTO && width > IMAGE_WIDTH)
    ) {
      await image.resize(IMAGE_WIDTH, IMAGE_HEIGHT);
    }
    await image.quality(80);
    if (code) {
      await image.print(black, 11, 19, `#${code}`);
      await image.print(black, 9, 21, `#${code}`);
      await image.print(black, 11, 21, `#${code}`);
      await image.print(black, 9, 19, `#${code}`);
      await image.print(white, 10, 20, `#${code}`);
    }
    image.write(output, () => {
      res.status(301);
      res.setHeader("Content-Type", req.file.mimetype);
      res.setHeader("Location", fileName);
      res.setHeader("Refresh", `0;url=${fileName}`);
      res.end();
    });
  } catch (e) {
    res.status(500);
    res.json({
      error: "Failed to optimize image",
    });
    console.error(e);
    res.end();
  }
  // res.end();
});

router.get("/status", (req, res) => {
  res.json({
    startTime: req.startTime,
    expiredOn: req.expiredOn,
    timestamp: Date.now(),
  });
});

module.exports = router;
