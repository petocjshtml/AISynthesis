function splitTextIntoChunks(text, maxLength = 1400, response) {
  const sentenceEndings = /([.!?])\s+/g;
  let chunks = [];
  let currentChunk = "";

  text.split(sentenceEndings).forEach((part, index, array) => {
    if (sentenceEndings.test(part)) {
      currentChunk += part;
    } else {
      if ((currentChunk + part).length > maxLength) {
        chunks.push(currentChunk.trim());
        currentChunk = part;
      } else {
        currentChunk += part;
      }
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  response.write(
    `event: update\ndata: Text bol rozdelený na časti s počtom: ${chunks.length}\n\n`
  );
  response.flush?.();

  return chunks;
}

module.exports = { splitTextIntoChunks };
