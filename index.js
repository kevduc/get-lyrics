const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const Node = {};
Node.TEXT_NODE = 3;

const dataFolder = "./data";

const lyricstranslateAPI = {
  getLyrics: async (nid) => {
    return await fetch(
      "https://lyricstranslate.com/en/callback/ltlyricsondemand/get/lyrics",
      {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        body: `nid=${nid}`,
        method: "POST",
        mode: "cors",
      }
    ).then((res) => res.json());
  },

  getTransliteration: async (customId) => {
    return await fetch(
      "https://lyricstranslate.com/en/callback/transliteration",
      {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        body: `id=custom-${customId}`,
        method: "POST",
        mode: "cors",
      }
    ).then((res) => res.json());
  },
};

(async () => {
  let url = "https://lyricstranslate.com/en/tamer-hosny-lyrics.html";
  let songs = await getSongs(url);
  let lyrics = await getLyrics(url);
})();

// Helper functions

function getFilenameFromURL(url) {
  return url
    .replace("https://lyricstranslate.com/", "")
    .replace(/\.html$/, "")
    .replace(/[^a-zA-Z]/g, "-");
}

async function getLyrics(url) {}

async function getSongs(url) {
  const filename = getFilenameFromURL(url);

  // Get songs
  let songs = null;
  const songsFilename = `${filename}.songs.json`;

  if (fs.existsSync(`${dataFolder}/${songsFilename}`)) {
    // Read from file
    let rawdata = fs.readFileSync(`${dataFolder}/${songsFilename}`);
    songs = JSON.parse(rawdata);
  } else {
    // Get from the internet
    songs = await extractSongsFromArtistPage(url);
    // Save songs data in file
    let rawdata = JSON.stringify(songs);
    fs.writeFileSync(`${dataFolder}/${songsFilename}`, rawdata);
  }

  return songs;
}

async function extractSongsFromArtistPage(url) {
  // Get data for each song
  let songs = await extractSongsDataFromPage(url);

  // Drop songs with no english translation
  songs = songs.filter((song) => song.englishTranslations.length > 0);

  // Get IDs for each song
  for (let song of songs) {
    song.id = null;
    song.transliterationId = null;

    for (let englishTranslation of song.englishTranslations) {
      const link = englishTranslation.link;
      // Get IDs
      let IDs = await extractIDsFromPage(link);

      // Set song ID and transliteration ID
      if (song.id === null) {
        song.id = IDs.songId;
        song.transliterationId = IDs.transliterationId;
      } else {
        if (IDs.songId !== song.id)
          console.warn(
            `Ignoring song ID ${IDs.songId}: Mismatch (${song.id}) for ${link}.`
          );

        if (IDs.transliterationId !== song.transliterationId)
          console.warn(
            `Ignoring transliteration ID ${IDs.transliterationId}: Mismatch (${song.transliterationId}) for ${link}.`
          );
      }

      // Add english translation ID
      const englishTranslationsId = song.englishTranslations.map(
        (englishTranslation) => englishTranslation.id
      );
      if (englishTranslationsId.includes(IDs.translationId))
        console.warn(
          `Ignoring english translation ID ${IDs.translationId}: Duplicate (${englishTranslationsId}) for ${link}.`
        );
      else englishTranslation.id = IDs.translationId;
    }
  }

  return songs;
}

async function extractSongsDataFromPage(url) {
  return await JSDOM.fromURL(url).then((dom) => {
    let document = dom.window.document;
    let songsData = extractSongsData(document);
    return songsData;
  });
}

function extractSongsData(document) {
  let songsData = Array.from(document.querySelectorAll(".songName")).map(
    (td) => {
      let lang = td.querySelector(".lang-artist").textContent;
      let songLink = td.querySelector("a");
      return {
        lang,
        link: songLink.href,
        englishTranslations: extractEnglishLinks(
          td.nextElementSibling
        ).map((link) => ({ link: link.href })),
      };
    }
  );

  const AuthorizedLang = ["Arabic", "Arabic (other varieties)"];

  return songsData.filter((songData) => AuthorizedLang.includes(songData.lang));
}

function extractEnglishLinks(td) {
  // Get single link
  let link = Array.from(td.querySelectorAll("a")).filter(
    (a) => a.textContent === "English"
  )[0];
  if (link !== undefined) return [link];

  // Get multiple links
  let english = Array.from(td.childNodes).filter(
    (node) =>
      node.nodeType === Node.TEXT_NODE && node.textContent.includes("English")
  )[0];
  if (english === undefined) return [];

  linkList = [];
  let node = english.nextElementSibling;
  while (node !== null && node.nodeName === "A") {
    linkList.push(node);
    node = node.nextElementSibling;
  }
  return linkList;
}

async function extractIDsFromPage(url) {
  return await JSDOM.fromURL(url).then(async (dom) => {
    let document = dom.window.document;

    // Get transliteration ID
    let transliterationId = null;
    let transliterationLink = document.querySelector("[id^='custom-']");
    if (transliterationLink !== null)
      transliterationId = transliterationLink.id;

    // Get song ID
    let songId = null;
    let scripts = Array.from(document.querySelectorAll("script"));
    let lastScript = scripts[scripts.length - 1];
    let songidMatches = lastScript.textContent.match(/\"songnid\":\"(.*?)\"/);
    if (songidMatches !== null) songId = songidMatches[1];

    // Get translation ID
    let translationId = null;
    let nidMatches = lastScript.textContent.match(/\"nid\":\"(.*?)\"/);
    if (nidMatches !== null) translationId = nidMatches[1];
    else {
      let thanks = document.querySelector("#thanks");
      if (thanks !== null) translationId = thanks.getAttribute("nid");
      else {
        let previewLink = document.querySelector("#lyrics-preview");
        if (previewLink !== null)
          translationId = previewLink.getAttribute("nid");
      }
    }

    return { songId, translationId, transliterationId };
  });
}

async function extractLyrics(document) {
  let arabic = document.querySelector("#song-body");
  let english = document.querySelector(".translate-node-text");
  let transliteration = document.querySelector("#song-transliteration");

  let lyrics = [];
  Array.from(arabic.querySelectorAll(".par")).forEach((par) =>
    Array.from(par.children).forEach((div) =>
      lyrics.push({ id: div.className, ar: div.textContent })
    )
  );
  return lyrics;
}

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
