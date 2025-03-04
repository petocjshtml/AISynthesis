const axios = require("axios");
const tough = require("tough-cookie");
const { generateUniqueFilename } = require("./generateUniqueFilename");
const { wrapper } = require("axios-cookiejar-support");
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));
const saveMp3 = require("./saveMp3");

async function getTTStream(text_to_speech) {
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
    const headers = {
      accept: "application/json, text/plain, */*",
      "accept-language": "sk,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
      priority: "u=1, i",
      "sec-ch-ua":
        '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-csrf-token": csrfToken,
      cookie: cookies,
      Referer: "https://speechactors.com/text-to-speech/slovak-slovakia",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };

    const formData = new FormData();
    formData.append("locale", "sk-SK");
    formData.append("text", text_to_speech);
    formData.append("voice", "sk-SK-LukasNeural");
    formData.append("style", "0");
    const fetchResponse = await fetch(url, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
    }

    var path = "";
    var stream = "";

    await fetchResponse.json().then((data) => {
      stream = data.stream;
    });

    await saveMp3(stream, "audios/" + generateUniqueFilename()).then(
      (path_of_synthesis) => {
        path = path_of_synthesis;
        console.log(`MP3 uložené ako: ${path}`);
      }
    );

    return path;
  } catch (error) {
    console.error("Chyba pri spracovaní:", error);
  }
}

module.exports = { getTTStream };
