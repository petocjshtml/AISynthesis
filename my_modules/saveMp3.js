const fs = require("fs");

async function saveMp3(base64Stream, outputPath = "synthesis.mp3") {
  return new Promise((resolve, reject) => {
    try {
      const base64Data = base64Stream.replace(/^data:audio\/mp3;base64,/, "");
      const binaryData = Buffer.from(base64Data, "base64");
      fs.writeFile(outputPath, binaryData, (err) => {
        if (err) {
          reject(`Chyba pri ukladaní MP3: ${err.message}`);
        } else {
          resolve(outputPath);
        }
      });
    } catch (error) {
      reject(`Neplatný vstup: ${error.message}`);
    }
  });
}

module.exports = saveMp3;
