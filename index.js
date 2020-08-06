const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const Node = {};
Node.TEXT_NODE = 3;

const dataFolder = "./data";

(async () => {
  let urls = [
    "https://lyricstranslate.com/en/amr-diab-lyrics.html",
    "https://lyricstranslate.com/en/tamer-hosny-lyrics.html",
    "https://lyricstranslate.com/en/oum-kalthoum-lyrics.html",
    "https://lyricstranslate.com/en/sherine-ahmad-lyrics.html",
    "https://lyricstranslate.com/en/abdel-halim-hafez-lyrics.html",
    "https://lyricstranslate.com/en/mohammed-hamaki-lyrics.html",
    "https://lyricstranslate.com/en/mostafa-atef-lyrics.html",
    "https://lyricstranslate.com/en/muhammad-tarek-muhammad-youssef-lyrics.html",
    "https://lyricstranslate.com/en/cairokee-lyrics.html",
    "https://lyricstranslate.com/en/hamza-namira-lyrics.html",
    "https://lyricstranslate.com/en/mohamed-mounir-lyrics.html",
    "https://lyricstranslate.com/en/ehab-tawfik-lyrics.html",
    "https://lyricstranslate.com/en/hani-shaker-lyrics.html",
    "https://lyricstranslate.com/en/hossam-habib-lyrics.html",
    "https://lyricstranslate.com/en/ramy-sabry-lyrics.html",
    "https://lyricstranslate.com/en/mohammed-fouad-lyrics.html",
    "https://lyricstranslate.com/en/hamada-helal-lyrics.html",
    "https://lyricstranslate.com/en/humood-al-khudher-lyrics.html",
    "https://lyricstranslate.com/en/amal-maher-lyrics.html",
    "https://lyricstranslate.com/en/tamer-ashour-lyrics.html",
    "https://lyricstranslate.com/en/donia-samir-ghanem-lyrics.html",
    "https://lyricstranslate.com/en/hisham-abbas-lyrics.html",
    "https://lyricstranslate.com/en/hakim-lyrics.html",
    "https://lyricstranslate.com/en/mohammed-abdel-wahab-lyrics.html",
    "https://lyricstranslate.com/en/moustafa-amar-lyrics.html",
    "https://lyricstranslate.com/en/najat-al-saghira-lyrics.html-0",
    "https://lyricstranslate.com/en/ramy-gamal-lyrics.html",
    "https://lyricstranslate.com/en/mahmoud-el-esseily-lyrics.html",
    "https://lyricstranslate.com/en/carmen-soliman-lyrics.html",
    "https://lyricstranslate.com/en/muhammed-ramadan-lyrics.html",
    "https://lyricstranslate.com/en/baha-soltan-lyrics.html",
    "https://lyricstranslate.com/en/el-joker-lyrics.html",
    "https://lyricstranslate.com/en/saad-el-soghayar-lyrics.html",
    "https://lyricstranslate.com/en/haytham-shaker-lyrics.html",
    "https://lyricstranslate.com/en/angham-lyrics.html",
    "https://lyricstranslate.com/en/mostafa-kamel-lyrics.html",
    "https://lyricstranslate.com/en/ruby-lyrics.html",
    "https://lyricstranslate.com/en/hassan-el-shafei-ft-ahmed-sheba-lyrics.html",
    "https://lyricstranslate.com/en/moustafa-hagag-lyrics.html",
    "https://lyricstranslate.com/en/mohamed-nour-lyrics.html",
    "https://lyricstranslate.com/en/hassan-al-asmar-lyrics.html",
    "https://lyricstranslate.com/en/zap-tharwat-lyrics.html",
    "https://lyricstranslate.com/en/abou-el-leef-lyrics.html",
    "https://lyricstranslate.com/en/yasmine-niazy-lyrics.html",
    "https://lyricstranslate.com/en/haytham-said-lyrics.html",
    "https://lyricstranslate.com/en/oka-wi-ortega-lyrics.html",
    "https://lyricstranslate.com/en/amr-moustafa-lyrics.html-0",
    "https://lyricstranslate.com/en/wama-band-lyrics.html",
    "https://lyricstranslate.com/en/ramy-essam-lyrics.html",
    "https://lyricstranslate.com/en/ayda-al-ayoubi-lyrics.html",
    "https://lyricstranslate.com/en/fayza-ahmed-lyrics.html",
    "https://lyricstranslate.com/en/sharmoofers-lyrics.html",
    "https://lyricstranslate.com/en/ahmed-gamal-lyrics.html",
    "https://lyricstranslate.com/en/issaf-lyrics.html",
    "https://lyricstranslate.com/en/ali-hassan-kuban-lyrics.html",
    "https://lyricstranslate.com/en/khaled-selim-lyrics.html",
    "https://lyricstranslate.com/en/wust-el-balad-lyrics.html",
    "https://lyricstranslate.com/en/marwa-nasr-lyrics.html",
    "https://lyricstranslate.com/en/mohamed-adawaya-lyrics.html",
    "https://lyricstranslate.com/en/soma-lyrics.html",
    "https://lyricstranslate.com/en/sherine-wagdy-lyrics.html",
    "https://lyricstranslate.com/en/abd-el-basset-hamouda-lyrics.html",
    "https://lyricstranslate.com/en/hameed-al-shaery-lyrics.html",
    "https://lyricstranslate.com/en/somaya-lyrics.html",
    "https://lyricstranslate.com/en/maya-kassab-lyrics.html",
    "https://lyricstranslate.com/en/maryam-saleh-lyrics.html",
    "https://lyricstranslate.com/en/khaled-ajaj-lyrics.html-0",
    "https://lyricstranslate.com/en/sandy-arabic-lyrics.html",
    "https://lyricstranslate.com/en/layla-morad-lyrics.html",
    "https://lyricstranslate.com/en/massar-egbari-lyrics.html",
    "https://lyricstranslate.com/en/hamza-el-din-lyrics.html",
    "https://lyricstranslate.com/en/kareem-abou-zeid-lyrics.html",
    "https://lyricstranslate.com/en/%D8%AD%D8%B3%D9%86-%D8%B4%D8%A7%D9%83%D9%88%D8%B4-lyrics.html",
    "https://lyricstranslate.com/en/loai-lyrics.html",
    "https://lyricstranslate.com/en/fatme-serhan-lyrics.html",
    "https://lyricstranslate.com/en/ahmed-adaweya-lyrics.html",
    "https://lyricstranslate.com/en/amina-lyrics.html",
    "https://lyricstranslate.com/en/tarek-el-sheikh-lyrics.html",
    "https://lyricstranslate.com/en/fady-badr-lyrics.html",
    "https://lyricstranslate.com/en/medhat-saleh-lyrics.html",
    "https://lyricstranslate.com/en/amir-mounib-lyrics.html",
    "https://lyricstranslate.com/en/akmal-lyrics.html",
    "https://lyricstranslate.com/en/ahmed-el-attar-lyrics.html",
    "https://lyricstranslate.com/en/tamer-seif-lyrics.html",
    "https://lyricstranslate.com/en/waleed-saad-lyrics.html",
    "https://lyricstranslate.com/en/mohammed-mohie-lyrics.html",
    "https://lyricstranslate.com/en/karim-mohsen-lyrics.html",
    "https://lyricstranslate.com/en/abu-lyrics.html",
    "https://lyricstranslate.com/en/better-life-team-lyrics.html",
    "https://lyricstranslate.com/en/yasser-lyrics.html",
    "https://lyricstranslate.com/en/dina-el-wedidi-lyrics.html",
    "https://lyricstranslate.com/en/ahmed-sheba-lyrics.html",
    "https://lyricstranslate.com/en/ahmed-brada-lyrics.html",
    "https://lyricstranslate.com/en/islam-zaki-lyrics.html",
    "https://lyricstranslate.com/en/yasmine-al-goharey-lyrics.html",
    "https://lyricstranslate.com/en/layla-ghofran-lyrics.html",
    "https://lyricstranslate.com/en/shadia-lyrics.html",
    "https://lyricstranslate.com/en/magdy-sa3ad-lyrics.html",
    "https://lyricstranslate.com/en/sherif-mekway-lyrics.html",
    "https://lyricstranslate.com/en/haytham-fahmy-lyrics.html",
  ];
  for (let url of urls) {
    let data = await getData(url);
  }
})();

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
  return getURLPage(url)
    .replace("-lyrics.html", "")
    .replace(/[^a-zA-Z\-]/g, "-");
}

async function getData(url) {
  const artist = getArtistFromURL(url);
  console.log(`--- ${artist} ---`);

  // Get data
  let data;
  const songsFilename = `${artist}.json`;
  const songsFile = `${dataFolder}/${songsFilename}`;

  if (fs.existsSync(songsFile)) {
    console.log(`Songs data for ${artist} already downloaded.`);
    console.log(`Reading songs data for ${artist} from file ${songsFile} ...`);
    // Read from file
    let rawdata = fs.readFileSync(songsFile);
    data = JSON.parse(rawdata);
    console.log(`Read songs data for ${artist} .`);
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
    console.log(`Saving songs data for ${artist} to file ${songsFile} ...`);
    let rawdata = JSON.stringify(data);
    fs.writeFileSync(songsFile, rawdata);
    console.log(`Saved songs data for ${artist} to file ${songsFile} .`);
  }

  if (!data.lyricsDownloaded) {
    console.log(`Dowloading lyrics for ${artist} ...`);
    for (song of data.songs) {
      // Original song
      // console.debug(`Dowloading lyrics for song ${getURLPage(song.link)} ...`);
      const songData = await getLyricsFromId(song.id);
      // console.debug(`Dowloaded lyrics for song ${getURLPage(song.link)} .`);
      song.lyrics = songData.lyrics;
      song.title = songData.title;

      // Transliteration
      // console.debug(
      //   `Dowloading transliteration for song ${getURLPage(song.link)} ...`
      // );
      const transliterationData = await getTransliterationFromId(
        song.transliteration.id
      );
      // console.debug(
      //   `Dowloaded transliteration for song ${getURLPage(song.link)} .`
      // );
      song.transliteration.lyrics = transliterationData.lyrics;
      song.transliteration.title = transliterationData.title;

      // English translation
      for (let englishTranslation of song.englishTranslations) {
        // console.debug(
        //   `Dowloading english translation ${getURLPage(
        //     englishTranslation.link
        //   )} for song ${getURLPage(song.link)} ...`
        // );
        const englishTranslationData = await getLyricsFromId(
          englishTranslation.id
        );
        // console.debug(
        //   `Dowloaded ${getURLPage(
        //     englishTranslation.link
        //   )} for song ${getURLPage(song.link)} .`
        // );
        englishTranslation.lyrics = englishTranslationData.lyrics;
        englishTranslation.title = englishTranslationData.title;
      }
    }

    data.lyricsDownloaded = true;

    // Save data in file
    let rawdata = JSON.stringify(data);
    fs.writeFileSync(songsFile, rawdata);
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

    for (let englishTranslation of song.englishTranslations) {
      const link = englishTranslation.link;
      // Get IDs
      console.debug(
        `   Extracting IDs for song ${getURLPage(
          song.link
        )}, english translation ${getURLPage(link)} ...`
      );
      let IDs = await extractIDsFromSongPage(link);

      // Set song ID and transliteration ID
      if (song.id === null) {
        song.id = IDs.songId;
        song.transliteration.id = IDs.transliterationId;
      } else {
        if (IDs.songId !== song.id)
          console.warn(
            `   Ignoring song ID ${IDs.songId}: Mismatch (${song.id}) for ${link} .`
          );

        if (IDs.transliterationId !== song.transliteration.id)
          console.warn(
            `   Ignoring transliteration ID ${IDs.transliterationId}: Mismatch (${song.transliteration.id}) for ${link} .`
          );
      }

      // Add english translation ID
      const englishTranslationsId = song.englishTranslations.map(
        (englishTranslation) => englishTranslation.id
      );
      if (englishTranslationsId.includes(IDs.translationId))
        console.warn(
          `   Ignoring english translation ID ${IDs.translationId}: Duplicate (${englishTranslationsId}) for ${link} .`
        );
      else englishTranslation.id = IDs.translationId;
    }
  }

  return songs;
}

async function extractSongsDataFromArtistPage(url) {
  return await JSDOM.fromURL(url).then((dom) => {
    let document = dom.window.document;
    let songsData = extractSongsData(document);
    return songsData;
  });
}

function extractSongsData(document) {
  let songsData = Array.from(document.querySelectorAll(".songName")).map(
    (td) => {
      let lang = td.querySelector(".lang-artist");
      if (lang !== null) lang = lang.textContent;
      let songLink = td.querySelector("a");
      return {
        lang,
        link: songLink !== null ? songLink.href : null,
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

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getURLPage(url) {
  let urlPathParts = new URL(url).pathname.split("/");
  return urlPathParts[urlPathParts.length - 1];
}
