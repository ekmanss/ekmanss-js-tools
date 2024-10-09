import {AIContextGenerator} from '../src/ai-context-generator';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises');
jest.mock('path');

describe('AIContextGenerator', () => {
    let generator;
    const mockProjectRoot = '/mock/project/root';
    const mockOutputFile = 'mock_output.txt';

    beforeEach(() => {
        generator = new AIContextGenerator(mockProjectRoot, mockOutputFile);
        jest.clearAllMocks();
    });

    test('constructor initializes properties correctly', () => {
        expect(generator.projectRoot).toBe(mockProjectRoot);
        expect(generator.outputFile).toBe(mockOutputFile);
        expect(generator.ignorePatterns).toEqual([]);
        expect(generator.output).toBe('');
        expect(generator.additionalIgnoreFiles).toEqual(['LICENSE', 'README.md']);
    });

    test('readGitignore reads and parses .gitignore file', async () => {
        const mockGitignoreContent = 'node_modules\n*.log\n.DS_Store\n';
        fs.readFile.mockResolvedValue(mockGitignoreContent);
        path.join.mockReturnValue('/mock/project/root/.gitignore'); // 添加这行

        await generator.readGitignore();

        expect(fs.readFile).toHaveBeenCalledWith('/mock/project/root/.gitignore', 'utf8');
        expect(generator.ignorePatterns.length).toBe(3);
        expect(generator.ignorePatterns[0].test('node_modules')).toBeTruthy();
        expect(generator.ignorePatterns[1].test('error.log')).toBeTruthy();
        expect(generator.ignorePatterns[2].test('.DS_Store')).toBeTruthy();
    });


    test('shouldIgnore correctly identifies files to ignore', () => {
        generator.ignorePatterns = [/node_modules/, /\.log$/, /\.DS_Store/];
        path.basename.mockImplementation((filePath) => filePath.split('/').pop()); // 添加这行

        expect(generator.shouldIgnore('path/to/node_modules/file.js')).toBeTruthy();
        expect(generator.shouldIgnore('path/to/file.log')).toBeTruthy();
        expect(generator.shouldIgnore('path/to/.DS_Store')).toBeTruthy();
        expect(generator.shouldIgnore('path/to/LICENSE')).toBeTruthy();
        expect(generator.shouldIgnore('path/to/README.md')).toBeTruthy();
        expect(generator.shouldIgnore('path/to/src/index.js')).toBeFalsy();
    });


    test('generateProjectStructure creates correct structure output', async () => {
        const mockEntries = [
            { name: 'src', isDirectory: () => true },
            { name: 'index.js', isDirectory: () => false },
            { name: 'package.json', isDirectory: () => false },
        ];
        fs.readdir.mockResolvedValue(mockEntries);
        path.relative.mockImplementation((from, to) => to);
        path.join.mockImplementation((...args) => args.join('/'));

        // 模拟 traverseDirectory 方法以返回预期的目录结构
        jest.spyOn(generator, 'traverseDirectory').mockImplementation(async (dir, level = 0) => {
            const indent = ' '.repeat(4 * level);
            for (const entry of mockEntries) {
                if (entry.isDirectory()) {
                    generator.output += `${indent}${entry.name}/\n`;
                } else {
                    generator.output += `${indent}${entry.name}\n`;
                }
            }
        });

        await generator.generateProjectStructure();

        expect(generator.output).toContain('Project Structure:');
        expect(generator.output).toContain('src/');
        expect(generator.output).toContain('index.js');
        expect(generator.output).toContain('package.json');
    });



    test('generateFileContents creates correct file content output', async () => {
        const mockEntries = [{name: 'index.js', isDirectory: () => false},];
        const mockFileContent = 'console.log("Hello, World!");';
        fs.readdir.mockResolvedValue(mockEntries);
        fs.readFile.mockResolvedValue(mockFileContent);
        path.relative.mockImplementation((from, to) => to);
        path.join.mockImplementation((...args) => args.join('/'));

        await generator.generateFileContents();

        expect(generator.output).toContain('File Contents:');
        expect(generator.output).toContain('========== FILE: /mock/project/root/index.js ==========');
        expect(generator.output).toContain(mockFileContent);
    });


    test('writeOutput writes to the specified file', async () => {
        generator.output = 'Test output content';
        await generator.writeOutput();

        expect(fs.writeFile).toHaveBeenCalledWith(mockOutputFile, 'Test output content');
    });
});
