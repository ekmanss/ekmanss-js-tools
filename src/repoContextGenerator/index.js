const fs = require('fs');
const {initIgnore} = require('../utils/fileUtils');
const {buildTree} = require('../utils/treeBuilder');
const {extractContent} = require('../utils/contentExtractor');


function generateRepoContext({repoPath, outputFile, options}) {
    // 初始化 ignore 实例
    options.ig = initIgnore(repoPath);

    // 构建目录树
    const treeLines = buildTree(repoPath, options);

    // 提取文件内容
    const contentLines = extractContent(repoPath, options);

    // 生成适用于 AI 理解的 Markdown 输出
    const outputLines = [
        '# 📁 代码库目录结构',
        '',
        '```',
        ...treeLines,
        '```',
        '',
        '# 📄 文件内容',
        '',
        ...contentLines,
    ];

    // 将结果写入 Markdown 文件
    fs.writeFileSync(outputFile, outputLines.join('\n'), 'utf-8');
    console.log(`结果已写入 ${outputFile}`);

    return outputLines;
}

// generateRepoContext({
//     repoPath: '/Users/linchuan/temp/clerk-react',
//     outputFile: 'output15.md',
//     options: {
//         repoPath: '/Users/linchuan/temp/clerk-react',
//         treeIgnorePatterns: [],
//         contentIgnorePatterns: ["**/*.lock", "**/*.svg", ".github/", "README.md", "LICENSE"],
//     }
// })


module.exports = generateRepoContext;