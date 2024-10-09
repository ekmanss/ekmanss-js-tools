import fs from 'fs/promises';
import path from 'path';

export class AIContextGenerator {
    constructor(projectRoot, outputFile, additionalIgnoreFiles = []) {
        this.projectRoot = projectRoot;
        this.outputFile = outputFile;
        this.ignorePatterns = [];
        this.output = '';
        this.additionalIgnoreFiles = ['LICENSE', 'README.md', ...additionalIgnoreFiles];
    }

    async analyze() {
        await this.readGitignore();
        await this.generateProjectStructure();
        await this.generateFileContents();
        await this.writeOutput();
    }

    async readGitignore() {
        const gitignorePath = path.join(this.projectRoot, '.gitignore');
        try {
            const content = await fs.readFile(gitignorePath, 'utf8');
            this.ignorePatterns = content
                .split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .map(pattern => new RegExp(pattern.replace(/\*/g, '.*')));
        } catch (error) {
            console.warn('No .gitignore file found or unable to read it.');
        }
    }

    shouldIgnore(filePath) {
        if (!filePath) return true; // 添加这行来处理 undefined 的情况
        if (filePath.split(path.sep).includes('.git')) return true;
        if (this.additionalIgnoreFiles.includes(path.basename(filePath))) return true;
        return this.ignorePatterns.some(pattern => pattern.test(filePath));
    }


    async generateProjectStructure() {
        this.output = "Project Structure:\n";  // 确保这里使用 '=' 而不是 '+='
        await this.traverseDirectory(this.projectRoot);
        this.output += "\n\n";
    }


    async traverseDirectory(dir, level = 0) {
        const entries = await fs.readdir(dir, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(this.projectRoot, fullPath);

            if (this.shouldIgnore(relativePath)) continue;

            const indent = ' '.repeat(4 * level);
            if (entry.isDirectory()) {
                this.output += `${indent}${entry.name}/\n`;
                await this.traverseDirectory(fullPath, level + 1);
            } else {
                this.output += `${indent}${entry.name}\n`;
            }
        }
    }

    async generateFileContents() {
        this.output += "File Contents:\n";
        await this.addFileContents(this.projectRoot);
    }

    async addFileContents(dir) {
        const entries = await fs.readdir(dir, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(this.projectRoot, fullPath);

            if (this.shouldIgnore(relativePath)) continue;

            if (entry.isDirectory()) {
                await this.addFileContents(fullPath);
            } else {
                this.output += `\n\n========== FILE: ${relativePath} ==========\n\n`;
                try {
                    const content = await fs.readFile(fullPath, 'utf8');
                    this.output += content + '\n';
                } catch (error) {
                    this.output += `Error reading file: ${error.message}\n`;
                }
            }
        }
    }


    async writeOutput() {
        await fs.writeFile(this.outputFile, this.output);
    }
}
