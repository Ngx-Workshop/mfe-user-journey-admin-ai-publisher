const config = require('./webpack.config');

// Preserve Angular module identities across optimized federation boundaries.
module.exports = {
  ...config,
  optimization: {
    ...config.optimization,
    concatenateModules: false,
  },
};
