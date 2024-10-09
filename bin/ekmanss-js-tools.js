#!/usr/bin/env node
import { AIContextGenerator } from '../src/index.js';
import path from 'path';
import readline from 'readline';

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function runAIContextGenerator() {
    const rl = createReadlineInterface();

    try {
        const projectRoot = await askQuestion(rl, 'Enter the project root directory: ');
        const outputFile = await askQuestion(rl, 'Enter the output file name (e.g., ai_context.txt): ');
        const additionalIgnore = await askQuestion(rl, 'Enter additional files to ignore (comma-separated): ');

        const additionalIgnoreFiles = additionalIgnore.split(',').map(file => file.trim());
        const fullOutputPath = path.resolve(process.cwd(), outputFile);

        const generator = new AIContextGenerator(projectRoot, fullOutputPath, additionalIgnoreFiles);
        await generator.analyze();

        console.log(`AI context has been generated and written to ${fullOutputPath}`);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close();
    }
}

async function main() {
    const rl = createReadlineInterface();

    console.log('Welcome to ekmanss-js-tools!');
    console.log('Available tools:');
    console.log('1. AI Context Generator');
    // Future tools can be added here

    const choice = await askQuestion(rl, 'Enter the number of the tool you want to use: ');

    switch (choice) {
        case '1':
            await runAIContextGenerator();
            break;
        // Future tools can be added here
        default:
            console.log('Invalid choice. Exiting.');
    }

    rl.close();
}

main();
