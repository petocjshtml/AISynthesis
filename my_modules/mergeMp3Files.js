const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

async function mergeMp3Files(audioFiles, outputFile = "output.mp3", res) {
  try {
    if (!Array.isArray(audioFiles) || audioFiles.length === 0) {
      throw new Error("Neboli poskytnuté žiadne audio súbory na spojenie.");
    }

    const ffmpegPath = path.join(__dirname, "ffmpeg/bin/ffmpeg.exe");
    if (!fs.existsSync(ffmpegPath))
      throw new Error(`❌ FFmpeg.exe sa nenašiel!`);

    const audiosDir = path.join(__dirname, "audios");
    const listFilePath = path.join(audiosDir, "filelist.txt");
    const outputFilePath = path.join(audiosDir, outputFile);

    const listContent = audioFiles
      .map((file) => `file '${path.basename(file)}'`)
      .join("\n");
    fs.writeFileSync(listFilePath, listContent, "utf8");

    res.write(
      `data: Začína sa proces spájania audiosúborov pomocou ffmpeg!\n\n`
    );
    res.flush?.();

    const ffmpegCommand = `"${ffmpegPath}" -f concat -safe 0 -i "${listFilePath}" -c copy "${outputFilePath}"`;

    return new Promise((resolve, reject) => {
      const process = exec(ffmpegCommand);

      process.on("close", (code) => {
        fs.unlinkSync(listFilePath);

        if (code !== 0) {
          console.error("❌ Chyba pri spájaní MP3");
          return reject("Chyba pri spájaní MP3.");
        }

        res.write(`data: Audionahrávky úspešne spojené!.\n\n`);
        res.flush?.();
        resolve(outputFilePath);
      });
    });
  } catch (error) {
    console.error("❌ Chyba:", error);
  }
}

module.exports = { mergeMp3Files };
