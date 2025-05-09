import { db } from "../libs/db.js";
import { getJudge0LanguageId, poolBatchResponse } from "../libs/lib.judge0";
export const createProblems = async (req, res) => {
  //Get data from Req body
  //check the role user
  //loop to reference solutions  for different languages
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;
  if (req.user.role != "ADMIN") {
    return res
      .status(403)
      .json({ error: "You are not allowed to create a problem " });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        res.status(400).json({ message: `NOT SUPPORTED LANGUAGE${language}` });
      }
      const submission = testCases.map((input, output) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));
      const submissionResults = await submitBatch(submission);
      const tokens = submissionResults.map((res) => {
        res.token;
      });
      const results = await poolBatchResponse(tokens);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Testcase ${i + 1} failed for the language ${language}`,
          });
        }
      }
    }
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      message: "Problem Created Succesfully ",
      newProblem: newProblem,
    });
  } catch (error) {
    
  }
};

export const getAllProblems = async (req, res) => {};
export const getProblemById = async (req, res) => {};
export const updateProblemById = async (req, res) => {};
export const deleteProblemById = async (req, res) => {};
export const getAllProblemSolvedByUser = async (req, res) => {};
