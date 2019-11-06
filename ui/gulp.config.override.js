/**
 * Rename this file to gulp.config.override.js to use it.
 */

module.exports = config => {

    config.dest.static = '../actinium/public';
    config.docs.dest = 'docs';

    return config;
};
