# ekmanss-js-tools

![CI/CD](https://github.com/yourusername/ekmanss-js-tools/workflows/CI/CD/badge.svg)

A collection of JavaScript tools including repo context generator.

... (其余内容保持不变)
# ekmanss-js-tools

A collection of JavaScript tools including repo context generator.

## Installation

```bash
npm install ekmanss-js-tools
```


Usage
```javascript
const { repoContextGenerator } = require('ekmanss-js-tools');

const options = {
  repoPath: '/path/to/your/repo',
  outputFile: 'output.txt', // Optional: if not provided, the function will return the content as a string
  additionalIgnorePatterns: ['.vscode', 'dist'], // Optional
  defaultIgnorePatterns: ['.git', 'node_modules', 'README.md'] // Optional, these are the default values
};

const repoContext = repoContextGenerator(options);

// If outputFile is not provided, you can use the returned string
console.log(repoContext);
```