const fs = require("fs");
const pdfParse = require("pdf-parse");

exports.extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "";
  } catch (err) {
    console.error("PDF parse error:", err.message);
    return "";
  }
};