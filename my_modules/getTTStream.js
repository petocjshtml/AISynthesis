const axios = require("axios");
const tough = require("tough-cookie");
const { generateUniqueFilename } = require("./generateUniqueFilename");
const { wrapper } = require("axios-cookiejar-support");
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));
const saveMp3 = require("./saveMp3");
const path = require("path");

async function getTTStream(textChunks, res) {
  try {
    const response = await client.get(
      "https://speechactors.com/text-to-speech/slovak-slovakia"
    );
    const cookiesArray = await cookieJar.getCookies("https://speechactors.com");
    const cookies = cookiesArray
      .map((cookie) => `${cookie.key}=${cookie.value}`)
      .join("; ");
    const csrfToken =
      cookiesArray.find((cookie) => cookie.key === "csrf_cookie_name")?.value ||
      "";
    const url = "https://speechactors.com/open-tool/generate";

    const requests = textChunks.map(async (text, index) => {
      res.write(
        `data: Odosiela sa request pre spracovanie textu ${index + 1}/${
          textChunks.length
        }\n\n`
      );
      res.flush?.();

      const formData = new FormData();
      formData.append("locale", "sk-SK");
      formData.append("text", text);
      formData.append("voice", "sk-SK-ViktoriaNeural");
      formData.append("style", "0");

      const fetchResponse = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          "x-csrf-token": csrfToken,
          cookie: cookies,
        },
        body: formData,
      });

      if (!fetchResponse.ok)
        throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
      const data = await fetchResponse.json();

      if (!data.stream || typeof data.stream !== "string") {
        throw new Error(
          `❌ API nevrátilo platný stream pre text č. ${index + 1}`
        );
      }

      return data.stream;
    });

    const streams = await Promise.all(requests);
    res.write(
      `data: Streamy získané, začínam ich dekódovať do formátu mp3\n\n`
    );
    res.flush?.();

    const savePromises = streams.map(async (stream, index) => {
      if (!stream) {
        res.write(
          `data: ❌ Chyba: Stream pre text č. ${index + 1} nebol získaný\n\n`
        );
        res.flush?.();
        return null;
      }

      const filename = generateUniqueFilename();
      const outputPath = path.join(__dirname, "audios", filename);

      try {
        const savedPath = await saveMp3(stream, outputPath);
        res.write(
          `data: Dekódovanie streamu č.${index + 1} prebehlo úspešne\n\n`
        );
        res.flush?.();
        return savedPath;
      } catch (error) {
        res.write(
          `data: ❌ Chyba pri dekódovaní streamu č.${index + 1}: ${
            error.message
          }\n\n`
        );
        res.flush?.();
        return null;
      }
    });

    const audioPaths = (await Promise.all(savePromises)).filter(Boolean);
    if (audioPaths.length === 0) {
      throw new Error("❌ Žiadny audio súbor nebol úspešne spracovaný.");
    }

    res.write(
      `data: Všetky streamy boli úspešne dekódované do formátu mp3!\n\n`
    );
    res.flush?.();

    return audioPaths;
  } catch (error) {
    res.write(`data: ❌ Chyba pri spracovaní: ${error.message}\n\n`);
    res.flush?.();
    return [];
  }
}

module.exports = { getTTStream };
