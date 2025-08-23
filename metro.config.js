const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add the React Native Worklets plugin to resolve the warning
config.transformer.babelTransformerPath = require.resolve('react-native-worklets/plugin');

module.exports = config;
