const crypto = require("crypto");
const path = require("path");

function generateUniqueFilename() {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(4).toString("hex");
  return `synthesis_${timestamp}${randomPart}.mp3`;
}

module.exports = { generateUniqueFilename };
