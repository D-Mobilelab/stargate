// Karma configuration
// Generated on Thu Apr 07 2016 16:48:56 GMT+0200 (CEST)
module.exports = function(config) {
    var karmaConf = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'test/*.test.js'
        ],

        // list of files to exclude
        exclude: [],
        preprocessors: {
        // source files, that you wanna generate coverage for
        // do not include tests or libraries
        // (these files will be instrumented by Istanbul)
            'src/**/*.js': ['browserify', 'coverage'],
            'test/**/*.js': ['browserify']
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['coverage', 'coveralls', 'mocha'],
        // optionally, configure the reporter
        // web server port
        port: 9000,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DISABLE,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        browserify: {
            debug: true,
            transform: [
                'envify',
                'babelify',
                ['browserify-istanbul', { instrumenter: require('isparta') }]
            ]
        },
        coverageReporter: {
            reporters: [
                { type: 'html', dir: 'coverage', subdir: 'html' },
                { type: 'text', dir: 'coverage', subdir: 'text' }
            ]
        },
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],
        browserConsoleLogOptions:{            
            level:  "debug",
            format: "%b %T: %m",            
            terminal: false            
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    };
  
    if (process.env.TRAVIS) {
        console.log('TRAVIS!', process.env.TRAVIS);
        console.log('Running Travis Chrome for tests');
        karmaConf.browsers = ['Chrome_travis_ci'];
    }  
    config.set(karmaConf);

};
