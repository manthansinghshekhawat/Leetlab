import { poolBatchResponse, submitBatch } from "../libs/lib.judge0";

export const executeCode = async (req, res) => {
  try {
    const { sourceCode, languageId, stdin, expectedOutput, problemId } =
      req.body;
    const userId = req.user.id;
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expectedOutput) ||
      expectedOutput.length !== stdin.length
    ) {
      return res.status(400).json({
        message: "Invalid or missing testCase",
      });
    }
    const submissions = stdin.map((input) => ({
      source_code: sourceCode,
      language_id: languageId,
      stdin: input,
    }));
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);
    const results = await poolBatchResponse(tokens);
    console.log(results);
    res.status(200).json({
      message: "Submited Successfully",
      results,
    });
  } catch (error) {}
};
