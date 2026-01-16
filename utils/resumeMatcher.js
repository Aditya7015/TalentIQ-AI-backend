const natural = require("natural");
const TfIdf = natural.TfIdf;

exports.calculateMatchScore = (resumeText, jobText) => {
  const tfidf = new TfIdf();

  tfidf.addDocument(resumeText);
  tfidf.addDocument(jobText);

  let score = 0;

  tfidf.tfidfs(jobText, (i, measure) => {
    score += measure;
  });

  // Normalize score to 0–100
  const normalizedScore = Math.min(100, Math.round(score * 10));

  return normalizedScore;
};
