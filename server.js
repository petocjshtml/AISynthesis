const express = require("express");
const { processTextToSpeech } = require("./my_modules/processTextToSpeech");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/audios",
  express.static(path.join(__dirname, "my_modules", "audios"))
);

app.get("/generate", async (req, res) => {
  const text = req.query.text;
  if (!text) {
    res.status(400).send("❌ Chyba: Nebol poskytnutý text.");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const keepAliveInterval = setInterval(() => {
    res.write(":\n\n");
    res.flush?.();
  }, 500);

  try {
    res.write(`data: 🔄 Začína spracovanie...\n\n`);
    res.flush?.();
    const result = await processTextToSpeech(text, res);
    const audioFilename = path.basename(result);
    res.write(
      `data: ✅ Hotovo! Audio vygenerované: http://localhost:${port}/audios/${audioFilename}\n\n`
    );
    res.flush?.();

    clearInterval(keepAliveInterval);
    res.write("data: \n\n");
    res.end();
  } catch (error) {
    res.write(`data: ❌ Chyba: ${error.message}\n\n`);
    res.flush?.();

    clearInterval(keepAliveInterval);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`✅ Server beží na porte ${port}`);
});
