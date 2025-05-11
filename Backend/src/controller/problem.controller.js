import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  poolBatchResponse,
  submitBatch,
} from "../libs/lib.judge0.js";
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
  console.log("hhhhh");
  if (req.user.role != "ADMIN") {
    return res
      .status(403)
      .json({ error: "You are not allowed to create a problem " });
  }

  try {
    console.log("indise problem create ");
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        res.status(400).json({ message: `NOT SUPPORTED LANGUAGE${language}` });
      }
      console.log(languageId);
      const submission = testCases.map((testCase) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));
      console.log(submission);
      const submissionResults = await submitBatch(submission);
      const tokens = submissionResults.map((res) => res.token);
      console.log(tokens);
      const results = await poolBatchResponse(tokens);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log(result);
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Testcase ${i + 1} failed for the language ${language}`,
          });
        }
      }
    }
    console.log("sab chal gya aage badho ");
    const newProblem = await db.problem.create({
      data: {
      title,
      description,
      difficulty,
      tags,
      examples: JSON.stringify(examples),
      constraints,
      testcases: testCases,
      codeSnippets,
      refernceSolutions: referenceSolutions,
      userId: req.user.id,
      },
    });

    return res.status(200).json({
      message: "Problem Created Successfully",
      newProblem: newProblem,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create problem",
      error: error.message,
    });
  }
};

export const getAllProblems = async (req, res) => {};
export const getProblemById = async (req, res) => {};
export const updateProblemById = async (req, res) => {};
export const deleteProblemById = async (req, res) => {};
export const getAllProblemSolvedByUser = async (req, res) => {};
