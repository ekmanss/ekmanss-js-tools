const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

const textExtensions = [// Web 开发
    '.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',

    // 后端语言
    '.py', '.rb', '.php', '.java', '.class', '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.swift', '.kt', '.kts', '.scala', '.clj', '.groovy',

    // 脚本语言
    '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd', '.vbs', '.pl', '.pm', '.t',

    // 标记语言
    '.md', '.markdown', '.rst', '.tex', '.textile',

    // 数据交换格式
    '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg',

    // 配置文件
    '.env', '.gitignore', '.dockerignore', '.editorconfig', '.eslintrc', '.prettierrc', '.babelrc', '.npmrc', '.yarnrc', '.conf', '.config', '.properties',

    // 数据库
    '.sql', '.psql', '.plsql',

    // 其他编程语言
    '.lua', '.r', '.dart', '.f', '.f90', '.f95', '.f03', '.f08', // Fortran
    '.hs', '.lhs', '.elm', // Haskell 和 Elm
    '.lisp', '.cl', '.el', // Lisp 家族
    '.erl', '.hrl', // Erlang
    '.ex', '.exs', // Elixir
    '.ml', '.mli', '.fs', '.fsi', '.fsx', // OCaml 和 F#

    // 模板语言
    '.ejs', '.pug', '.jade', '.haml', '.twig', '.mustache', '.handlebars', '.hbs',

    // 特定领域语言 (DSLs)
    '.graphql', '.gql', '.proto',

    // 文本和日志文件
    '.txt', '.log', '.csv', '.tsv',

    // 版本控制
    '.patch', '.diff',

    // 构建工具和包管理器配置
    '.gradle', '.sbt', '.pom', '.ivy', '.ant', '.cabal', '.gemspec', '.podspec', 'Makefile', 'Dockerfile', 'Vagrantfile', 'Jenkinsfile',

    // 移动开发
    '.plist', '.storyboard', '.xib',

    // 游戏开发
    '.unity', '.unityproj', '.prefab', '.mat', '.shader',

    // 3D 建模和动画
    '.obj', '.blend',

    // 其他
    '.svg', '.dot', // 矢量图形和图表
];

function readGitignore(repoPath) {
    const gitignorePath = path.join(repoPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        return fs.readFileSync(gitignorePath, 'utf8').split('\n');
    }
    return [];
}

function isTextFile(filePath) {
    return textExtensions.includes(path.extname(filePath).toLowerCase());
}

function generateTree(dir, ig, prefix = '', basePath = '') {
    let output = '';
    const files = fs.readdirSync(dir);
    const filteredFiles = files.filter(file => !ig.ignores(path.join(basePath, file)));

    filteredFiles.forEach((file, index) => {
        const fullPath = path.join(dir, file);
        const relativePath = path.join(basePath, file);
        const isLast = index === filteredFiles.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        output += prefix + marker + file + '\n';

        if (fs.statSync(fullPath).isDirectory()) {
            output += generateTree(fullPath, ig, newPrefix, relativePath);
        }
    });
    return output;
}

function traverseDirectory(dir, ig, basePath = '') {
    let output = '';
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = path.join(basePath, file);

        if (ig.ignores(relativePath)) continue;

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            output += traverseDirectory(fullPath, ig, relativePath);
        } else if (stats.isFile()) {
            output += '\n' + '='.repeat(80) + '\n';
            output += `File: ${relativePath}\n`;
            output += '-'.repeat(80) + '\n';

            if (!isTextFile(fullPath)) {
                output += `[Non-text file]\n`;
            } else {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    output += `${content.trim()}\n`;
                } catch (error) {
                    output += `[Error reading file: ${error.message}]\n`;
                }
            }
            output += '='.repeat(80) + '\n';
        }
    }

    return output;
}

function generateRepoContext(options) {
    const {
        repoPath,
        outputFile,
        additionalIgnorePatterns = [],
        defaultIgnorePatterns = ['.git', 'node_modules', 'README.md'],
    } = options;

    const ignorePatterns = [...defaultIgnorePatterns, ...additionalIgnorePatterns];
    const ig = ignore().add(readGitignore(repoPath)).add(ignorePatterns);

    let output = "Project Tree Structure:\n";
    output += generateTree(repoPath, ig);
    output += "\n\nFile Contents:\n";
    output += traverseDirectory(repoPath, ig);

    if (outputFile) {
        fs.writeFileSync(outputFile, output);
        console.log(`Repository context has been written to ${outputFile}`);
    }

    return output;
}


module.exports = generateRepoContext;