const path = require("path");
const { getTTStream } = require("./getTTStream");
const { splitTextIntoChunks } = require("./splitTextIntoChunks");
const { mergeMp3Files } = require("./mergeMp3Files");
const { generateUniqueFilename } = require("./generateUniqueFilename");

async function processTextToSpeech(fullText, res) {
  const textChunks = splitTextIntoChunks(fullText, 1400, res);

  res.write(
    `data: Text bol rozdelený na časti s počtom: ${textChunks.length}\n\n`
  );
  res.flush?.();

  const audioPaths = await getTTStream(textChunks, res);
  const outputFilename = generateUniqueFilename();
  const outputAudioPath = await mergeMp3Files(audioPaths, outputFilename, res);

  return outputAudioPath;
}

module.exports = { processTextToSpeech };
