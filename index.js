const downloadData = require("./downloadData.js");
const preprocessData = require("./preprocessData.js");
const compileData = require("./compileData.js");

(async () => {
  await downloadData();
  preprocessData();
  compileData();
})();
