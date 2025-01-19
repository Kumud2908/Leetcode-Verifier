"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process"); // For compiling and running the C++ file
const child_process_2 = require("child_process");
const node_fetch_1 = __importDefault(require("node-fetch")); // For fetching test cases
const fs = __importStar(require("fs")); // For writing test cases to a file
const path = __importStar(require("path"));
const he = __importStar(require("he"));
async function activate(context) {
    console.log("Activating extension...");
    const getTestCasesCommand = vscode.commands.registerCommand('extension.getLeetCodeTestCases', async () => {
        const url = await vscode.window.showInputBox({
            placeHolder: 'Enter a LeetCode problem URL',
            prompt: 'Provide the LeetCode URL to fetch test cases and expected outputs.',
        });
        if (!url) {
            vscode.window.showWarningMessage('No URL provided.');
            return;
        }
        try {
            console.log(`Fetching test cases for URL: ${url}`);
            const urlParts = new URL(url);
            if (urlParts.hostname !== 'leetcode.com') {
                vscode.window.showErrorMessage('Only LeetCode URLs are supported.');
                return;
            }
            const pathSegments = urlParts.pathname.split('/');
            if (pathSegments.length !== 4 || pathSegments[1] !== 'problems') {
                vscode.window.showErrorMessage('Invalid LeetCode URL. URL format is incorrect.');
                return;
            }
            const titleSlug = pathSegments[2];
            console.log(`Extracted titleSlug: ${titleSlug}`);
            const apiUrl = `https://alfa-leetcode-api.onrender.com/select?titleSlug=${titleSlug}`;
            const response = await (0, node_fetch_1.default)(apiUrl);
            const data = await response.json();
            if (!data || !data.question || !data.exampleTestcases) {
                vscode.window.showErrorMessage('Failed to fetch valid question HTML or example test cases.');
                return;
            }
            const questionHtml = data.question;
            const rawTestCases = data.exampleTestcases.split('\n');
            console.log('Raw test cases received:', rawTestCases);
            const parsedTestCases = fetchExpectedTestCases(questionHtml);
            if (parsedTestCases.length === 0) {
                vscode.window.showErrorMessage('No test cases found.');
                return;
            }
            const testCasesSize = parsedTestCases.length;
            // Clean HTML entities in inputs before formatting them
            const formattedInputs = parsedTestCases
                .map(tc => {
                const input1 = tc.input && tc.input[0] ? he.decode(tc.input[0]) : ''; // Handle undefined inputs
                const input2 = tc.input && tc.input[1] ? he.decode(tc.input[1]) : ''; // Handle undefined inputs
                return `${input1}\n${input2}`;
            })
                .join('\n');
            console.log('Formatted inputs:', formattedInputs);
            console.log("formatted outout uptil now is  ");
            console.log(parsedTestCases);
            const formattedOutputs = parsedTestCases
                .map(tc => {
                if (Array.isArray(tc.expected_output)) {
                    // Convert array to string while keeping the array brackets and separating elements with commas
                    return `[${tc.expected_output.map(output => he.decode(String(output))).join(', ')}]`;
                }
                else {
                    return he.decode(String(tc.expected_output));
                }
            })
                .join('\n');
            console.log('Formatted outputs:', formattedOutputs);
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found. Test cases will not be saved.');
                return;
            }
            const testFilePath = `${workspaceFolder}/test_cases.txt`;
            const expectedOutputFilePath = `${workspaceFolder}/expected_outputs.txt`;
            try {
                // Save raw test cases and expected outputs
                const formattedRawTestcases = formatTestCasesForFile(rawTestCases, testCasesSize);
                fs.writeFileSync(testFilePath, `${testCasesSize}\n${formattedRawTestcases}`);
                fs.writeFileSync(expectedOutputFilePath, formattedOutputs);
                // console.log('Decoded inputs:', cleanedInputs);
                // console.log('Decoded outputs:', formattedOutputs);
                // Explicitly clean the HTML entities in the files after writing
                cleanHtmlEntitiesInFile(testFilePath);
                cleanHtmlEntitiesInFile(expectedOutputFilePath);
                vscode.window.showInformationMessage(`Test cases saved to ${testFilePath} and expected outputs saved to ${expectedOutputFilePath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to save files: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error fetching test cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    function formatTestCasesForFile(rawTestCases, numberOfTestCases) {
        // Calculate the number of elements per test case
        const elementsPerTestCase = Math.ceil(rawTestCases.length / numberOfTestCases);
        // Split raw test cases into chunks based on elements per test case
        const chunkedTestCases = [];
        for (let i = 0; i < rawTestCases.length; i += elementsPerTestCase) {
            chunkedTestCases.push(rawTestCases.slice(i, i + elementsPerTestCase));
        }
        // Format the chunked test cases as a string where each chunk is a line
        const formattedTestCases = chunkedTestCases
            .map(chunk => chunk.join(' ')) // Join each chunk into a single line
            .join('\n'); // Join all lines with newlines
        return formattedTestCases;
    }
    const removeUnwantedCharacters = (input) => {
        if (!input) {
            console.error('Input is undefined or null');
            return ''; // Return an empty string or handle as needed
        }
        console.log('Removing unwanted characters from:', input); // Debug original input
        const cleanedInput = input.replace(/&quot;||;/g, '');
        console.log('Cleaned input:', cleanedInput); // Debug cleaned input
        return cleanedInput;
    };
    const cleanHtmlEntitiesInFile = (filePath) => {
        try {
            // Read the input file
            const inputData = fs.readFileSync(filePath, 'utf-8');
            // Decode HTML entities
            const cleanedData = he.decode(inputData);
            // Write the cleaned data back to the same file
            fs.writeFileSync(filePath, cleanedData, 'utf-8');
            console.log(`File cleaned and saved back to ${filePath}`);
        }
        catch (error) {
            console.error(`Error reading or writing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    function fetchExpectedTestCases(question) {
        const testCases = [];
        const examples = question.split('<strong class="example">');
        for (let i = 1; i < examples.length; i++) {
            const example = examples[i];
            const inputStart = example.indexOf('<strong>Input:</strong>');
            const outputStart = example.indexOf('<strong>Output:</strong>');
            if (inputStart !== -1 && outputStart !== -1) {
                try {
                    // Extract input section
                    const inputSection = example
                        .substring(inputStart + '<strong>Input:</strong>'.length, outputStart)
                        .trim();
                    // Match all inputs
                    const inputMatches = inputSection.match(/(\w+)\s*=\s*(\.*?\|\S+)/g);
                    const inputs = inputMatches ? inputMatches.map(match => match.split('=')[1].trim()) : [];
                    // Extract output section
                    const outputSection = example
                        .substring(outputStart + '<strong>Output:</strong>'.length)
                        .split('<')[0]
                        .trim();
                    // Parse output as JSON
                    const output = JSON.parse(outputSection);
                    // Push to test cases
                    testCases.push({ input: inputs, expected_output: output });
                }
                catch (error) {
                    console.error(`Failed to parse example at index ${i}:`, error);
                }
            }
        }
        console.log(testCases);
        return testCases;
    }
    function extractIndices(text) {
        const numbers = text.match(/-?\d+/g);
        return numbers ? numbers.map(Number) : [];
    }
    // Command 2: Run the extension logic
    const runExtensionCommand = vscode.commands.registerCommand('extension.runExtension', async () => {
        console.log('Running extension logic...');
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }
        const testFilePath = `${workspaceFolder}/test_cases.txt`;
        const cppFilePath = `${workspaceFolder}/solution.cpp`;
        const pythonFilePath = `${workspaceFolder}/solution.py`;
        const expectedOutputFilePath = `${workspaceFolder}/expected_outputs.txt`;
        if (!fs.existsSync(testFilePath)) {
            vscode.window.showErrorMessage('Test cases file not found. Please fetch test cases first.');
            return;
        }
        // Retrieve the user's preferred language from settings
        const config = vscode.workspace.getConfiguration('leetcode');
        const selectedLanguage = config.get('language') || 'C++'; // Default to C++ if no setting is found
        // Check if the corresponding file exists
        if (selectedLanguage === 'C++' && !fs.existsSync(cppFilePath)) {
            vscode.window.showErrorMessage('C++ solution file not found. Please add a solution.cpp file to your workspace.');
            return;
        }
        else if (selectedLanguage === 'Python' && !fs.existsSync(pythonFilePath)) {
            vscode.window.showErrorMessage('Python solution file not found. Please add a solution.py file to your workspace.');
            return;
        }
        // Compile and run the appropriate file
        if (selectedLanguage === 'C++') {
            compileAndRunCppFile(cppFilePath, testFilePath, expectedOutputFilePath);
        }
        else if (selectedLanguage === 'Python') {
            runPythonFile(pythonFilePath, testFilePath, expectedOutputFilePath);
        }
    });
    // Register the commands
    context.subscriptions.push(getTestCasesCommand, runExtensionCommand);
}
const runPythonFile = (pythonFilePath, testFilePath, expectedOutputFilePath) => {
    console.log(`Running Python file: ${pythonFilePath}`);
    const runCommand = `python3 "${pythonFilePath}" < "${testFilePath}"`;
    console.log(`Running command: ${runCommand}`);
    (0, child_process_1.exec)(runCommand, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Execution failed: ${stderr || error.message}`);
            console.error(`Execution Error: ${stderr || error.message}`);
            return;
        }
        console.log(`Execution successful. Output:\n${stdout}`);
        const outputFilePath = `${pythonFilePath}_output.txt`;
        fs.writeFileSync(outputFilePath, stdout);
        compareOutputs(expectedOutputFilePath, outputFilePath);
        vscode.window.showInformationMessage(`Execution output saved to ${outputFilePath}`);
    });
};
// Function to compile and run the C++ file
const compileAndRunCppFile = (cppFilePath, testFilePath, expectedOutputFilePath) => {
    console.log(`Compiling and running C++ file: ${cppFilePath}`);
    const executablePath = cppFilePath.replace('.cpp', ''); // Remove .cpp to get the executable name
    const compileCommand = `g++ -o "${executablePath}" "${cppFilePath}"`;
    console.log('file paths', cppFilePath, testFilePath);
    // Compile the C++ file
    (0, child_process_1.exec)(compileCommand, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Compilation failed: ${stderr}`);
            console.error(`Compilation Error: ${stderr}`);
            return;
        }
        console.log(`Compilation successful. Executable created at: ${executablePath}`);
        // Resolve absolute paths
        const absoluteExecutablePath = path.resolve(executablePath);
        const absoluteTestFilePath = path.resolve(testFilePath);
        // Check if the executable exists
        if (!fs.existsSync(absoluteExecutablePath)) {
            vscode.window.showErrorMessage('Executable file not found after compilation.');
            return;
        }
        const runCommand = `"${absoluteExecutablePath}" < "${absoluteTestFilePath}"`;
        console.log(`Running command: ${runCommand}`);
        // Run the executable with the test cases
        if (!fs.existsSync(absoluteExecutablePath)) {
            vscode.window.showErrorMessage(`Executable not found at ${absoluteExecutablePath}`);
            return;
        }
        if (!fs.existsSync(absoluteTestFilePath)) {
            vscode.window.showErrorMessage(`Test file not found at ${absoluteTestFilePath}`);
            return;
        }
        // Ensure the file is executable
        console.log("permission checking start");
        fs.chmodSync(absoluteExecutablePath, '755');
        console.log("permission checking done");
        const child = (0, child_process_2.execFile)(absoluteExecutablePath, [], { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
            if (error) {
                const errorMessage = `Execution failed: ${stderr || error.message}`;
                vscode.window.showErrorMessage(errorMessage);
                console.error(`Execution Error: ${stderr || error.message}`);
                return;
            }
            console.log(`Execution successful. Output:\n${stdout}`);
            const outputFilePath = `${absoluteExecutablePath}_output.txt`;
            fs.writeFileSync(outputFilePath, stdout);
            compareOutputs(expectedOutputFilePath, outputFilePath);
            vscode.window.showInformationMessage(`Execution output saved to ${outputFilePath}`);
        });
        const input = fs.createReadStream(absoluteTestFilePath);
        if (child.stdin) {
            const input = fs.createReadStream(absoluteTestFilePath);
            input.pipe(child.stdin);
        }
        else {
            vscode.window.showErrorMessage('Failed to access stdin of the child process.');
        }
    });
};
// Function to compare outputs
const compareOutputs = (expectedOutputFilePath, outputFilePath) => {
    try {
        const expectedOutput = fs.readFileSync(expectedOutputFilePath, 'utf-8').trim();
        const actualOutput = fs.readFileSync(outputFilePath, 'utf-8').trim();
        if (expectedOutput === actualOutput) {
            vscode.window.showInformationMessage('Outputs match!');
        }
        else {
            vscode.window.showErrorMessage('Outputs do not match!');
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error reading output files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
