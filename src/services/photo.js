const { HttpError } = require("../utils/http");
const cloudinary = require("cloudinary").v2;
module.exports = async function uploadPhoto(file) {
  if (!file)
    throw new HttpError(400, "Choose a PNG, JPEG or WebP image (maximum 2 MB)");
  const bytes = file.buffer;
  const valid =
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    (bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP");
  if (!valid) throw new HttpError(400, "Invalid image content");
  if (!process.env.CLOUDINARY_API_SECRET)
    throw new HttpError(503, "Image storage is not configured");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "interviewhub",
          resource_type: "image",
          allowed_formats: ["jpg", "png", "webp"],
          transformation: [
            { width: 256, height: 256, crop: "fill" },
            { fetch_format: "png" },
          ],
        },
        (error, result) =>
          error
            ? reject(new HttpError(503, "Image upload failed"))
            : resolve(result),
      )
      .end(bytes);
  });
};
