const fs = require('fs');
const path = require('path');
const { isIgnored } = require('./fileUtils');

/**
 * 遍历目录，收集文件内容
 * @param {string} currentPath - 当前路径
 * @param {object} options - 配置选项
 * @returns {string[]} - 文件内容的行数组
 */
function extractContent(currentPath, options) {
    const {
        repoPath,
        ig,
        treeIgnorePatterns = [],
        contentIgnorePatterns = [],
    } = options;

    let contentLines = [];
    let items = fs.readdirSync(currentPath);

    // 过滤忽略的文件和目录
    items = items.filter(item => {
        const fullPath = path.join(currentPath, item);
        return !isIgnored(fullPath, repoPath, ig, treeIgnorePatterns);
    });

    items.forEach(item => {
        const fullPath = path.join(currentPath, item);
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(repoPath, fullPath).replace(/\\/g, '/');

        if (stats.isDirectory()) {
            contentLines = contentLines.concat(extractContent(fullPath, options));
        } else {
            // 判断是否在 contentIgnorePatterns 列表或 .gitignore 中
            if (!isIgnored(fullPath, repoPath, ig, contentIgnorePatterns)) {
                // 添加文件内容
                contentLines.push(`## 文件：${relativePath}`);
                const fileExtension = (path.extname(fullPath).slice(1) || 'txt').toLowerCase();
                const content = fs.readFileSync(fullPath, 'utf-8');

                // 将 Markdown 代码块中的特殊字符进行转义
                const escapedContent = content.replace(/```/g, '\\`\\`\\`');

                // 使用 Markdown 代码块表示代码内容，并指定语言类型
                contentLines.push('```' + fileExtension);
                contentLines.push(escapedContent);
                contentLines.push('```');
                contentLines.push(''); // 添加空行，分隔文件内容
            }
        }
    });

    return contentLines;
}

module.exports = {
    extractContent,
};