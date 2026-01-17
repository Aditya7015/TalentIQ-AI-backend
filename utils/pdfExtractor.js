const axios = require("axios");
const pdfParse = require("pdf-parse");

exports.extractTextFromPDF = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    const data = await pdfParse(response.data);
    return data.text || "";
  } catch (error) {
    console.error("PDF parse error:", error.message);
    return "";
  }
};
