const fs = require("fs");
const path = require("path");

async function saveMp3(base64Stream, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      if (!base64Stream || typeof base64Stream !== "string") {
        reject("❌ Chyba pri ukladaní MP3: Stream je neplatný alebo prázdny.");
        return;
      }

      const base64Data = base64Stream.replace(/^data:audio\/mp3;base64,/, "");
      const binaryData = Buffer.from(base64Data, "base64");

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFile(outputPath, binaryData, (err) => {
        if (err) {
          reject(`❌ Chyba pri ukladaní MP3: ${err.message}`);
        } else {
          console.log(`🎵 MP3 uložené ako: ${outputPath}`);
          resolve(outputPath);
        }
      });
    } catch (error) {
      reject(`❌ Neplatný vstup: ${error.message}`);
    }
  });
}

module.exports = saveMp3;
