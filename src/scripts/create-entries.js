const fs = require("fs");
const path = require("path");

String.prototype.hashCode = function () {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function reducer(state, currentFunction) {
  return currentFunction(state);
}

function createName(data) {
  return [
    (x) => x["item box"] || x["item~ box"],
    (x) => x.hashCode(),
    (x) => `${x}.json`,
  ].reduce(reducer, data);
}

function writeFile(item) {
  return [
    (i) => ({ ...i, stringData: JSON.stringify(i.data, null, 2) }),
    (i) => fs.writeFileSync(i.filePath, i.stringData),
  ].reduce(reducer, item);
}

function run({ inputPath, outputPath }) {
  return [
    (x) => path.join(inputPath, "data.json"),
    fs.readFileSync,
    JSON.parse,
    (list) => list.map((data) => ({ fileName: createName(data), data })),
    (list) =>
      list.map((data) => ({
        ...data,
        filePath: path.join(outputPath, data.fileName),
      })),
    (list) => list.map(writeFile),
  ].reduce(reducer, inputPath);
}

const ioPath = path.join(__dirname, "../../", "data");

run({ inputPath: ioPath, outputPath: ioPath });
