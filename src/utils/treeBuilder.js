const fs = require('fs');
const path = require('path');
const { isIgnored } = require('./fileUtils');

/**
 * 构建目录树
 * @param {string} currentPath - 当前路径
 * @param {object} options - 配置选项
 * @param {string} [prefix=''] - 前缀用于格式化树形结构
 * @returns {string[]} - 目录树的行数组
 */
function buildTree(currentPath, options, prefix = '') {
    const {
        repoPath,
        ig,
        treeIgnorePatterns = [],
    } = options;

    let treeLines = [];
    let items = fs.readdirSync(currentPath);

    // 过滤忽略的文件和目录
    items = items.filter(item => {
        const fullPath = path.join(currentPath, item);
        return !isIgnored(fullPath, repoPath, ig, treeIgnorePatterns);
    });

    // 按名称排序，目录在前，文件在后
    items.sort((a, b) => {
        const fullPathA = path.join(currentPath, a);
        const fullPathB = path.join(currentPath, b);
        const isDirA = fs.statSync(fullPathA).isDirectory();
        const isDirB = fs.statSync(fullPathB).isDirectory();
        if (isDirA && !isDirB) return -1;
        if (!isDirA && isDirB) return 1;
        return a.localeCompare(b);
    });

    items.forEach((item, index) => {
        const fullPath = path.join(currentPath, item);
        const isDir = fs.statSync(fullPath).isDirectory();
        const isLast = index === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = prefix + (isLast ? '    ' : '│   ');

        // 添加当前项到目录树
        treeLines.push(prefix + connector + item + (isDir ? '/' : ''));

        // 如果是目录，递归调用
        if (isDir) {
            treeLines = treeLines.concat(buildTree(fullPath, options, childPrefix));
        }
    });

    return treeLines;
}

module.exports = {
    buildTree,
};