import axios from "axios";

export const getJudge0LanguageId = (language) => {
  const langugeMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return langugeMap[language.toUpperCase()];
};
export const submitBatch = async (submissions) => {
  try {
    console.log("befor request ");
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.sulu.sh/submissions/batch",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.SULU_KEY}`,
      },
      data: { submissions },
    };

    const { data } = await axios.request(options);
    console.log("submission results ", data);
    return data;
  } catch (error) {
    console.error("Error submitting batch:", error.message);
    throw error;
  }
};
const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
export const poolBatchResponse = async (tokens) => {
  while (true) {
    try {
      const options = {
        method: "GET",
        url: "https://judge0-ce.p.sulu.sh/submissions/batch",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.SULU_KEY}`,
        },
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      };

      const { data } = await axios.request(options);
      const results = data.submissions;
      const isAllDone = results.every(
        (r) => r.status.id !== 1 && r.status.id !== 2
      );
      if (isAllDone) {
        return results;
      }
      await sleep(1000);
    } catch (error) {
      console.error("Error polling batch:", error.message);
      throw error;
    }
  }
};


export function getLanguageName(languageId) {
  const LANGUAGE_NAMES = {
    74: "TypeScript",
    63: "JavaScript",
    71: "Python",
    62: "Java",
  };

  return LANGUAGE_NAMES[languageId] || "Unknown";
}
