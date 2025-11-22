module.exports = {
  title: 'Bittery Protocol',
  tagline: 'Bitcoin-native Lottery Protocol',
  url: 'https://docs.bittery.dev',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'bittery-protocol',
  projectName: 'bittery-docs',

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/bittery-protocol/bittery-docs/edit/main/',
        },
      },
    ],
  ],
};
