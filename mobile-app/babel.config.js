module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module path aliases — matches the alias map below.
      // Lets you write:  import { X } from '@/components/X'
      // Instead of:      import { X } from '../../components/X'
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/constants': './constants',
            '@/context': './context',
            '@/hooks': './hooks',
            '@/services': './services',
            '@/utils': './utils',
            '@/assets': './assets',
          },
          extensions: ['.js', '.jsx', '.json'],
        },
      ],
      // Required for react-native-reanimated — must be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};
