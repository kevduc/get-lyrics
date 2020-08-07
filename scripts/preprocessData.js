const fs = require("fs");
const dataLyricsFolder = "./data/data-lyrics";
const dataPreProcessedFolder = "./data/data-preprocessed";

module.exports = () => {
  if (!fs.existsSync(dataPreProcessedFolder)) {
    fs.mkdirSync(dataPreProcessedFolder);
  }

  let jsonFiles = fs
    .readdirSync(dataLyricsFolder)
    .filter((filename) => filename.search(/\.json$/) != -1);

  jsonFiles.forEach((file) => {
    console.log(`Pre-processing ${file}`);
    let rawdata = fs.readFileSync(`${dataLyricsFolder}/${file}`);
    data = JSON.parse(rawdata);

    data = data.songs.map((song) => ({
      artist: data.artist,
      arabic: {
        title: song.title,
        id: song.lyrics.map((verse) => verse.id),
        text: song.lyrics.map((verse) => verse.text),
      },
      english: song.englishTranslations.map((englishTranslation) => ({
        title: englishTranslation.title,
        id: englishTranslation.lyrics.map((verse) => verse.id),
        text: englishTranslation.lyrics.map((verse) => verse.text),
      })),
    }));

    // delete data.lyricsDownloaded;

    fs.writeFileSync(
      `${dataPreProcessedFolder}/preprocessed-${file}`,
      JSON.stringify(data)
    );
  });
};
