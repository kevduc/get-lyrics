const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const artistsLinksFile = "./data/artistsLinks.json";

module.exports = async () => {
  if (fs.existsSync(artistsLinksFile)) {
    console.log(`Artists links already downloaded.`);
    console.log(`Reading artists links from file ${artistsLinksFile} .`);
    let rawdata = fs.readFileSync(artistsLinksFile);
    return JSON.parse(rawdata);
  }

  let lastPageNumber = null;
  let pageNumber = 0;
  let artistsLinks = [];

  console.log(`Dowloading artists links...`);

  while (pageNumber <= lastPageNumber) {
    let dom = await JSDOM.fromURL(
      `https://lyricstranslate.com/en/artists/none/12/115/0-page-${pageNumber}`
    );
    let document = dom.window.document;

    if (lastPageNumber === null) {
      lastPageNumber = parseInt(
        getURLPage(
          document.querySelector(".pager-last").querySelector("a").href
        ).match(/0-page-(\d*)/)[1]
      );
    }

    artistsLinks.push(
      ...Array.from(
        document.querySelectorAll("td.artist-ico + td > a[title]")
      ).map((a) => decodeURI(a.href))
    );

    pageNumber++;
  }

  console.log(`Dowloaded artists links.`);
  // Save data in file
  console.log(`Saving artists links to file ${artistsLinksFile} .`);
  fs.writeFileSync(`./${artistsLinksFile}`, JSON.stringify(artistsLinks));

  return artistsLinks;
};

function getURLPage(url) {
  let urlPathParts = new URL(url).pathname.split("/");
  return urlPathParts[urlPathParts.length - 1];
}
