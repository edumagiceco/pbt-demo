const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Supported programming languages
const supportedLanguages = {
    javascript: {
        fileExtension: '.js',
        executeCommand: 'node',
        image: 'node:20-alpine',
        timeout: 5, // seconds
    },
    python: {
        fileExtension: '.py',
        executeCommand: 'python',
        image: 'python:3.12-alpine',
        timeout: 5, // seconds
    },
    java: {
        fileExtension: '.java',
        compileCommand: 'javac',
        executeCommand: 'java',
        image: 'openjdk:21-alpine',
        timeout: 10, // seconds
    },
    cpp: {
        fileExtension: '.cpp',
        compileCommand: 'g++',
        executeCommand: './a.out',
        image: 'gcc:12-alpine',
        timeout: 5, // seconds
    }
};

/**
 * Execute code in a Docker container
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} input - Input data for the program
 * @returns {Promise<object>} - Result of code execution
 */
async function executeCode(code, language, input) {
    // Check if language is supported
    if (!supportedLanguages[language]) {
        throw new Error(`지원하지 않는 언어입니다: ${language}`);
    }

    const langConfig = supportedLanguages[language];
    const executionId = crypto.randomBytes(16).toString('hex');
    
    // Create temporary directory and files
    const tempDir = path.join(__dirname, '../../tmp', executionId);
    const sourceFile = path.join(tempDir, `solution${langConfig.fileExtension}`);
    const inputFile = path.join(tempDir, 'input.txt');
    const outputFile = path.join(tempDir, 'output.txt');

    try {
        // Ensure temp directory exists
        await fs.mkdir(tempDir, { recursive: true });
        
        // Write code and input files
        await fs.writeFile(sourceFile, code);
        await fs.writeFile(inputFile, input || '');
        
        // Determine command based on language
        let compileCmd = '';
        let runCmd = '';
        
        // For languages that need compilation
        if (langConfig.compileCommand) {
            switch (language) {
                case 'java':
                    // Extract class name for Java
                    const className = extractJavaClassName(code);
                    compileCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.compileCommand} solution${langConfig.fileExtension}`;
                    runCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.executeCommand} ${className} < input.txt > output.txt 2>&1`;
                    break;
                case 'cpp':
                    compileCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.compileCommand} -o a.out solution${langConfig.fileExtension}`;
                    runCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.executeCommand} < input.txt > output.txt 2>&1`;
                    break;
                default:
                    compileCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.compileCommand} solution${langConfig.fileExtension}`;
                    runCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.executeCommand} < input.txt > output.txt 2>&1`;
            }
        } else {
            // For interpreted languages
            runCmd = `docker run --rm -v "${tempDir}:/code" -w /code ${langConfig.image} ${langConfig.executeCommand} solution${langConfig.fileExtension} < input.txt > output.txt 2>&1`;
        }
        
        const startTime = Date.now();
        
        // Compile if needed
        if (compileCmd) {
            try {
                await exec(compileCmd);
            } catch (error) {
                return {
                    success: false,
                    status: 'compile_error',
                    output: error.stderr || error.stdout,
                    executionTime: Date.now() - startTime,
                    memoryUsed: 0
                };
            }
        }
        
        // Execute with timeout
        try {
            await exec(`timeout ${langConfig.timeout}s ${runCmd}`);
            const output = await fs.readFile(outputFile, 'utf8');
            
            return {
                success: true,
                status: 'success',
                output,
                executionTime: Date.now() - startTime,
                memoryUsed: 0 // Memory measurement requires additional tooling
            };
        } catch (error) {
            // Check for timeout
            if (error.code === 124) {
                return {
                    success: false,
                    status: 'timeout',
                    output: '실행 시간이 초과되었습니다.',
                    executionTime: langConfig.timeout * 1000,
                    memoryUsed: 0
                };
            } else {
                // Runtime error
                return {
                    success: false,
                    status: 'runtime_error',
                    output: await fs.readFile(outputFile, 'utf8') || error.message,
                    executionTime: Date.now() - startTime,
                    memoryUsed: 0
                };
            }
        }
    } catch (error) {
        console.error('코드 실행 오류:', error);
        throw error;
    } finally {
        // Cleanup temp files
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            console.error('임시 파일 정리 오류:', error);
        }
    }
}

/**
 * Extract the class name from Java code
 * @param {string} code - Java source code
 * @returns {string} - Main class name
 */
function extractJavaClassName(code) {
    // Simple regex to extract public class name
    const match = code.match(/public\s+class\s+(\w+)/);
    
    if (match && match[1]) {
        return match[1];
    }
    
    // Default to Main if not found
    return 'Main';
}

/**
 * Evaluate a solution against test cases
 * @param {string} code - Source code to evaluate
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test cases
 * @returns {Promise<object>} - Evaluation results
 */
async function evaluateSolution(code, language, testCases) {
    const results = {
        passed: 0,
        failed: 0,
        totalScore: 0,
        totalPoints: 0,
        testResults: [],
        overallSuccess: false,
        executionTime: 0,
    };

    for (const testCase of testCases) {
        try {
            const executionResult = await executeCode(code, language, testCase.input);
            
            // Normalize output by trimming whitespace and newlines
            const expectedOutput = testCase.expectedOutput.trim();
            const actualOutput = executionResult.output.trim();
            
            const testPassed = actualOutput === expectedOutput;
            const testScore = testPassed ? testCase.points : 0;
            
            results.testResults.push({
                testCaseId: testCase.id,
                description: testCase.description,
                passed: testPassed,
                isHidden: testCase.isHidden,
                points: testCase.points,
                score: testScore,
                executionTime: executionResult.executionTime,
                memory: executionResult.memoryUsed,
                input: testCase.isHidden ? '[숨겨진 테스트 케이스]' : testCase.input,
                expectedOutput: testCase.isHidden ? '[숨겨진 테스트 케이스]' : testCase.expectedOutput,
                actualOutput: testCase.isHidden ? '[숨겨진 출력]' : actualOutput,
                status: executionResult.status
            });
            
            // Update statistics
            if (testPassed) {
                results.passed++;
            } else {
                results.failed++;
            }
            
            results.totalScore += testScore;
            results.totalPoints += testCase.points;
            results.executionTime += executionResult.executionTime;
        } catch (error) {
            console.error('테스트 케이스 실행 오류:', error);
            
            results.testResults.push({
                testCaseId: testCase.id,
                description: testCase.description,
                passed: false,
                isHidden: testCase.isHidden,
                points: testCase.points,
                score: 0,
                executionTime: 0,
                memory: 0,
                input: testCase.isHidden ? '[숨겨진 테스트 케이스]' : testCase.input,
                expectedOutput: testCase.isHidden ? '[숨겨진 테스트 케이스]' : testCase.expectedOutput,
                actualOutput: '실행 오류: ' + error.message,
                status: 'error'
            });
            
            results.failed++;
            results.totalPoints += testCase.points;
        }
    }
    
    // Calculate overall success and percentage
    results.overallSuccess = results.failed === 0;
    results.percentageScore = results.totalPoints > 0 
        ? Math.round((results.totalScore / results.totalPoints) * 100) 
        : 0;
    
    return results;
}

module.exports = {
    executeCode,
    evaluateSolution,
    supportedLanguages
};