/* eslint-disable global-require */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const webpack = require('@cypress/webpack-preprocessor');
const { initPlugin } = require('cypress-plugin-snapshots/plugin');
const percyHealthCheck = require('@percy/cypress/task');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on(
    'file:preprocessor',
    webpack({
      webpackOptions: require('../../node_modules/@vue/cli-service/webpack.config.js'),
      watchOptions: {},
    }),
  );
  on('task', percyHealthCheck);
  /**
   * @todo Investigate hasBinary issue
   * @body Seems to be consuming CPU resources and causing actions to fail
   */
  // on('task', require('@cypress/code-coverage/task'));
  // on(
  //   'file:preprocessor',
  //   require('@cypress/code-coverage/use-browserify-istanbul'),
  // );
  initPlugin(on, config);
  return config;
};
