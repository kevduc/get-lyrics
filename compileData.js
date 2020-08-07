const fs = require("fs");
const dataPreProcessedFolder = "./data-preprocessed";
const dataCompiledFile = "./data-compiled.json";

module.exports = () => {
  let dataCompiled = [];

  let jsonFiles = fs
    .readdirSync(dataPreProcessedFolder)
    .filter((filename) => filename.search(/\.json$/) != -1);

  dataCompiled = [];

  // Concatenate songs from all artists together
  jsonFiles.forEach((file) => {
    console.log(`Compiling ${file}`);
    let rawdata = fs.readFileSync(`${dataPreProcessedFolder}/${file}`);
    data = JSON.parse(rawdata);
    dataCompiled.push(...data);
  });

  // Remove english translations that don't have matching IDs with the arabic lyrics
  dataCompiled.forEach((song) => {
    let arabicIDs = song.arabic.id.join("");
    song.english = song.english.filter(
      (lyrics) => lyrics.id.join("") === arabicIDs
    );
  });

  // Remove songs that don't have an english translation anymore
  dataCompiled = dataCompiled.filter((song) => song.english.length > 0);

  let arrays = {
    arabic: [],
    english: [],
    // translationNum: [],
  };

  // Compile all verses into arrays
  dataCompiled.forEach((song) => {
    song.arabic.text.forEach((arabicVerse, i) => {
      let englishVerses = song.english.map((lyrics) => lyrics.text[i]);
      // Remove duplicate english verses
      englishVerses = englishVerses.filter(
        (verse, i, arr) => arr.indexOf(verse, i + 1) === -1
      );
      englishVerses.forEach((englishVerse, i) => {
        arrays.arabic.push(arabicVerse);
        arrays.english.push(englishVerse);
        // arrays.translationNum.push(i);
      });
    });
  });

  fs.writeFileSync(dataCompiledFile, JSON.stringify(arrays));
};
