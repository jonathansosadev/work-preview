const path = require('path');
const rootPath = path.resolve(__dirname, '../');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.scss$/,
    use: [
      'vue-style-loader',
      'css-loader',
      {
        loader: 'sass-loader',
        options: {
          prependData: `
						@import "../../assets/style/global.scss";
						@import "../../assets/style/variables.scss";		`
        }
      }
    ],
  });

  config.resolve.alias['@'] = rootPath;
  // config.resolve.alias['~'] = rootPath;

  return config
};
