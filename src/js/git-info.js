const gitInfo = require('git-describeify', __dirname, {
  requireAnnotated: false // Uses --tags, so that simple git tags are allowed.
});

export { gitInfo };
