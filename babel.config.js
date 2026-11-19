module.exports = function (api) {
  // Env values are inlined at build time. Disabling the Babel cache
  // keeps a changed .env from sticking around after Metro restarts.
  api.cache(false);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: true,
          allowUndefined: false,
        },
      ],
    ],
  };
};
