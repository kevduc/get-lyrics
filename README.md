# Gathering data for an `Egyptian Arabic ↔ English` translation model 💬

The data is gathered from translations of Egyptian songs on lyrics websites.
This is achieved using the JavaScript scripts in the `scripts` folder, executed with Node.

## 📘 How to use

- ▶ Run `npm start`
- ☑ Once the execution is finished, the gathered data will be in `data-compiled.json` in the `data` folder.
- 🔠 Import the json file as a table by running `makeTable.m` in MATLAB from the `matlab` folder.

## 📚 Detailed Explanations

### 📥 Gathering data from [lyricstranslate.com](https://lyricstranslate.com/)

1. 📜 `getArtistsLinks.js` gets and saves a list of only Egyptian Artists

2. 📜 `downloadData.js` gets and saves the list of their songs and the lyrics both in Arabic and English for each song (bonus: it also gets the transliteration)

3. 📜 `preprocessData.js` splits the verse ID from its text into 2 arrays. It does this for every songs of every artists, so it's easier to compile the data afterwards.

4. 📜 `compileData.js` compiles the data into 2 arrays of sentences, one containing all the Arabic verses and one containing all the English verses. It's aligning the data, e.g. it's matching the verse ID from each language so that the sentence at index i of the English array corresponds to the translation of the sentence at index i in the Arabic array.

> ℹ A snapshot of the data is saved for every step of the process, so the data required by a specific step won't be downloaded again when a snapshot exists.

### ⚙ Using the data
The data can then be imported as a table in MATLAB to train a transformer model.  
In the `matlab` folder:
- 🔠 `tableTotal.mat` contains all the Egyptian Arabic - English sentence pairs, it's the table that will be used for training
- 📜 `makeTable.m` generates the table. This script imports the JSON data as a table in MATLAB.

## Other potential websites
- [arabicmusictranslation.com](http://www.arabicmusictranslation.com/)
> For now data is only gathered from [lyricstranslate.com](https://lyricstranslate.com/)
