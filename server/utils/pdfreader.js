import { PdfReader } from "pdfreader";

async function readPDF(filename) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    new PdfReader().parseFileItems(filename, function (err, item) {
      if (err) {
        reject("Error while parsing file.");
      } else if (!item) {
        resolve(chunks.join("-"));
      } else if (item.text) {
        // accumulate text items into rows object, per line
        chunks.push(item.text);
      }
    });
  });
}

export default readPDF;
