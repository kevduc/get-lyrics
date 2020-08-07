const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const artistsLinksFile = "./artistsLinks.json";

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
    fetch("https://lyricstranslate.com/en/artists/none/12/115/0", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "cache-control": "max-age=0",
        "if-none-match": 'W/"1596762928-1"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
      body: null,
      method: "GET",
      mode: "cors",
    });
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
