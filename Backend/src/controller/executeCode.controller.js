import { db } from "../libs/db.js";
import {
  getLanguageName,
  poolBatchResponse,
  submitBatch,
} from "../libs/lib.judge0.js";
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
    console.log("tokens adre", tokens);
    const results = await poolBatchResponse(tokens);
    console.log(results);
    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expectedOutput[i]?.trim();
      const passed = stdout === expected_output;
      if (!passed) allPassed = false;
      // console.log(`Testcase #${i + 1}`);
      // console.log(`Input for testcase #${i + 1}: ${stdin[i]}`);
      // console.log(`Expected Output for testcase #${i + 1}: ${expected_output}`);
      // console.log(`Actual output for testcase #${i + 1}: ${stdout}`);
      // console.log(`Matched testcase #${i + 1}: ${passed}`);
      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    // console.log(detailedResults);
    // console.log("Creating submission with data:");
    // console.log("userId:", userId);
    // console.log("problemId:", problemId);
    // console.log("sourceCode:", sourceCode);
    // console.log("language:", getLanguageName(languageId));
    // console.log("stdin:", stdin.join("\n"));
    // console.log(
    //   "stdout:",
    //   JSON.stringify(detailedResults.map((r) => r.stdout))
    // );
    // console.log(
    //   "stderr:",
    //   detailedResults.some((r) => r.stderr)
    //     ? JSON.stringify(detailedResults.map((r) => r.stderr))
    //     : null
    // );
    // console.log(
    //   "compileOutput:",
    //   detailedResults.some((r) => r.compileOutput)
    //     ? JSON.stringify(detailedResults.map((r) => r.compileOutput))
    //     : null
    // );
    // console.log("status:", allPassed ? "Accepted" : "Wrong Answer");
    // console.log(
    //   "memory:",
    //   detailedResults.some((r) => r.memory)
    //     ? JSON.stringify(detailedResults.map((r) => r.memory))
    //     : null
    // );
    // console.log(
    //   "time:",
    //   detailedResults.some((r) => r.time)
    //     ? JSON.stringify(detailedResults.map((r) => r.time))
    //     : null
    // );

    const submission = await db.Submissions.create({
      data: {
        userId,
        problemId,
        sourceCode: sourceCode,
        language: getLanguageName(languageId),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compileOutput)
          ? JSON.stringify(detailedResults.map((r) => r.compileOutput))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });
    if (allPassed) {
      await db.ProblemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }
    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCases: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compiledOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));
    await db.TestCaseResult.createMany({
      data: testCaseResults,
    });
    const submissionWithTestCase = await db.Submissions.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Code Executed! Successfully!",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Error executing code:", error.message);
    res.status(500).json({ error: "Failed to execute code" });
  }
};
