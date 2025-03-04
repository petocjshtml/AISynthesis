const express = require("express");
const { getTTStream } = require("./my_modules/getTTStream");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/audios", express.static(path.join(__dirname, "audios")));

app.post("/generate", async (req, res) => {
  const { text } = req.body;
  try {
    const result = await getTTStream(text);

    res.json({ audioUrl: `http://localhost:${port}/${result}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server beží na porte ${port}`);
});
