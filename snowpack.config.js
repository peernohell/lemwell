module.exports = {
  extends: "@snowpack/app-scripts-svelte",
  scripts: {
    'mount:src': 'mount src --to /dist',
  },
  plugins: ["@snowpack/plugin-svelte" /* , "@snowpack/plugin-parcel" */],
  installOptions: {
    rollup: {
      plugins: [require('rollup-plugin-svelte')()]
    }
  },
  devOptions: {
    bundle: false,
  },
  buildOptions: {
    metaDir: 'meta',
  },
  proxy: {
    '/v2': 'https://api.profitwell.com/v2'
  }
}
