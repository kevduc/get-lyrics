const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const getArtistsLinks = require("./getArtistsLinks.js");

const Node = {};
Node.TEXT_NODE = 3;

const dataLyricsFolder = "./data/data-lyrics";

module.exports = async () => {
  let urls = await getArtistsLinks();
  urls.forEach(async (url, i) => {
    console.log(`Progress: ${i + 1}/${urls.length}`);
    let data = await getData(url);
  });
};

// Helper functions

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
        body: `id=${customId}`,
        method: "POST",
        mode: "cors",
      }
    ).then((res) => res.json());
  },
};

function getArtistFromURL(url) {
  return decodeURI(
    getURLPage(url)
      .replace("-lyrics.html", "")
      .replace(/[^%a-zA-Z0-9\-]/g, "-")
  ).replace("%", "-");
}

async function getData(url) {
  const artist = getArtistFromURL(url);
  console.log(`--- ${artist} ---`);

  // Get data
  let data;
  const songsFilename = `${artist}.json`; // TODO: consider limiting path length to 255 chars for Windows
  const songsFile = `${dataLyricsFolder}/${songsFilename}`;

  if (fs.existsSync(songsFile)) {
    console.log(`Songs data for ${artist} already downloaded.`);
    console.log(`Reading songs data for ${artist} from file ${songsFile} .`);
    // Read from file
    let rawdata = fs.readFileSync(songsFile);
    data = JSON.parse(rawdata);
    // console.log(`Read songs data for ${artist} .`);
  } else {
    // Get from the internet
    console.log(`Dowloading songs data for ${artist} ...`);
    data = {
      artist,
      lyricsDownloaded: false,
      songs: await extractSongsFromArtistPage(url),
    };
    console.log(`Dowloaded songs data for ${artist} .`);
    // Save data in file
    console.log(`Saving songs data for ${artist} to file ${songsFile} .`);
    fs.writeFileSync(songsFile, JSON.stringify(data));
    // console.log(`Saved songs data for ${artist} to file ${songsFile} .`);
  }

  if (!data.lyricsDownloaded) {
    console.log(`Dowloading lyrics for ${artist} ...`);
    for (song of data.songs) {
      // Original song
      console.debug(
        `   Dowloading lyrics for song ${getURLPageDecode(song.link)} ...`
      );
      const songData = await getLyricsFromId(song.id);
      // console.debug(`   Dowloaded lyrics for song ${getURLPageDecode(song.link)} .`);
      song.lyrics = songData.lyrics;
      song.title = songData.title;

      // Transliteration
      // console.debug(
      //   `   Dowloading transliteration for song ${getURLPageDecode(song.link)} ...`
      // );
      const transliterationData = await getTransliterationFromId(
        song.transliteration.id
      );
      // console.debug(
      //   `   Dowloaded transliteration for song ${getURLPageDecode(song.link)} .`
      // );
      song.transliteration.lyrics = transliterationData.lyrics;
      song.transliteration.title = transliterationData.title;

      // English translation
      for (let englishTranslation of song.englishTranslations) {
        // console.debug(
        //   `   Dowloading english translation ${getURLPageDecode(
        //     englishTranslation.link
        //   )} for song ${getURLPageDecode(song.link)} ...`
        // );
        const englishTranslationData = await getLyricsFromId(
          englishTranslation.id
        );
        // console.debug(
        //   `   Dowloaded ${getURLPageDecode(
        //     englishTranslation.link
        //   )} for song ${getURLPageDecode(song.link)} .`
        // );
        englishTranslation.lyrics = englishTranslationData.lyrics;
        englishTranslation.title = englishTranslationData.title;
      }
    }

    data.lyricsDownloaded = true;

    // Save data in file
    fs.writeFileSync(songsFile, JSON.stringify(data));
  } else {
    console.log(`Lyrics for ${artist} already downloaded.`);
  }

  return data;
}

async function getLyricsFromId(id) {
  let data = { title: null, lyrics: null };
  if (id === null) return data;

  let lyricsData = await lyricstranslateAPI.getLyrics(id);
  if (lyricsData.status !== 1) {
    console.warn(
      `Failed to get lyrics for id ${id}: ${JSON.stringify(lyricsData)}`
    );
    return data;
  }

  let verses = extractVerses(lyricsData.data);

  return {
    title: JSDOM.fragment(lyricsData.title).textContent,
    lyrics: verses,
  };
}

async function getTransliterationFromId(id) {
  let data = { title: null, lyrics: null };
  if (id === null) return data;

  let transliterationData = await lyricstranslateAPI.getTransliteration(id);
  if (transliterationData === null) {
    console.warn(
      `Failed to get transliteration lyrics for id ${id}: ${JSON.stringify(
        transliterationData
      )}`
    );
    return data;
  }

  let verses = extractVerses(transliterationData.body);

  return { title: transliterationData.title, lyrics: verses };
}

function extractVerses(html) {
  let lyricsBody = JSDOM.fragment(html);
  let verses = Array.from(lyricsBody.querySelectorAll('[class^="ll-"]')).map(
    (div) => ({
      id: div.className.replace("ll-", ""),
      text: div.textContent,
    })
  );

  return verses;
}

/// Songs Data

async function extractSongsFromArtistPage(url) {
  // Get data for each song
  let songs = await extractSongsDataFromArtistPage(url);

  // Drop songs with no english translation
  songs = songs.filter((song) => song.englishTranslations.length > 0);

  // Get IDs for each song
  for (let song of songs) {
    song.id = null;
    song.transliteration = { id: null };
    console.debug(
      `   Extracting IDs for song ${getURLPageDecode(song.link)} ...`
    );

    for (let englishTranslation of song.englishTranslations) {
      const link = englishTranslation.link;
      // Get IDs
      console.debug(
        `      Extracting IDs for english translation ${getURLPageDecode(
          link
        )} of song ${getURLPageDecode(song.link)} ...`
      );
      let IDs = await extractIDsFromSongPage(link);

      // Set song ID and transliteration ID
      if (song.id === null) {
        song.id = IDs.songId;
        song.transliteration.id = IDs.transliterationId;
      } else {
        if (IDs.songId !== song.id)
          console.warn(
            `      Ignoring song ID ${IDs.songId}: Mismatch (${song.id}) for ${link} .`
          );

        if (IDs.transliterationId !== song.transliteration.id)
          console.warn(
            `      Ignoring transliteration ID ${IDs.transliterationId}: Mismatch (${song.transliteration.id}) for ${link} .`
          );
      }

      // Add english translation ID
      const englishTranslationsId = song.englishTranslations.map(
        (englishTranslation) => englishTranslation.id
      );
      if (englishTranslationsId.includes(IDs.translationId))
        console.warn(
          `      Ignoring english translation ID ${IDs.translationId}: Duplicate (${englishTranslationsId}) for ${link} .`
        );
      else englishTranslation.id = IDs.translationId;
    }
  }

  return songs;
}

async function extractSongsDataFromArtistPage(url) {
  let dom = await JSDOM.fromURL(url);
  let document = dom.window.document;
  let songsData = extractSongsData(document);
  return songsData;
}

function extractSongsData(document) {
  let songsData = Array.from(document.querySelectorAll(".songName")).map(
    (td) => {
      let lang = td.querySelector(".lang-artist");
      if (lang !== null) lang = lang.textContent;
      let songLink = td.querySelector("a");
      return {
        lang,
        link: songLink !== null ? decodeURI(songLink.href) : null,
        englishTranslations: extractEnglishLinks(
          td.nextElementSibling
        ).map((link) => ({ link: decodeURI(link.href) })),
      };
    }
  );

  const AuthorizedLang = ["Arabic", "Arabic (other varieties)"];

  return songsData.filter((songData) => AuthorizedLang.includes(songData.lang));
}

function extractEnglishLinks(td) {
  if (td === null) return [];

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

async function extractIDsFromSongPage(url) {
  let dom = await JSDOM.fromURL(url);
  let document = dom.window.document;

  // Get transliteration ID
  let transliterationId = null;
  let transliterationLink = document.querySelector("[id^='custom-']");
  if (transliterationLink !== null) transliterationId = transliterationLink.id;

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
      if (previewLink !== null) translationId = previewLink.getAttribute("nid");
    }
  }

  return { songId, translationId, transliterationId };
}

function getURLPage(url) {
  let urlPathParts = new URL(url).pathname.split("/");
  return urlPathParts[urlPathParts.length - 1];
}

function getURLPageDecode(url) {
  return decodeURI(getURLPage(url));
}
