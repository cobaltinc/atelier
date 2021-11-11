const path = require('path');

const resolvePath = _path => path.join(process.cwd(), _path);

module.exports = {
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
    },
  },
  stories: ['../stories/*.stories.tsx'],
};
