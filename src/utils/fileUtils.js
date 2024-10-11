const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');
const ignore = require('ignore');

/**
 * 初始化 ignore 实例，读取 .gitignore 文件
 * @param {string} repoPath - 代码库路径
 * @returns {object} - ignore 实例
 */
function initIgnore(repoPath) {
    const gitignorePath = path.join(repoPath, '.gitignore');
    return fs.existsSync(gitignorePath)
        ? ignore().add(fs.readFileSync(gitignorePath, 'utf-8'))
        : ignore();
}

/**
 * 判断路径是否应被忽略
 * @param {string} targetPath - 目标路径
 * @param {string} repoPath - 代码库路径
 * @param {object} ig - ignore 实例
 * @param {string[]} additionalPatterns - 额外的忽略模式
 * @returns {boolean}
 */
function isIgnored(targetPath, repoPath, ig, additionalPatterns) {
    const relativePath = path.relative(repoPath, targetPath).replace(/\\/g, '/');
    // 检查 .gitignore
    if (ig.ignores(relativePath)) {
        return true;
    }
    // 检查额外的忽略模式
    return additionalPatterns.some(pattern => minimatch(relativePath, pattern));
}

module.exports = {
    initIgnore,
    isIgnored,
};