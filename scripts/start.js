const {Component} = require('./lib/Component');
const {ComponentFilesystem} = require('./lib/Component/Filesystem');
const {ComponentCompound} = require('./lib/Component/Compound');
const {Job} = require('./lib/Job');
const {TaskTwing} = require('./lib/Task/Twing');
const {TaskSass} = require('./lib/Task/Sass');
const {TaskBrowserify} = require('./lib/Task/Browserify');
const {outputFile} = require('fs-extra');
const {create: createBrowserSync, has: hasBrowserSync, get: getBrowserSync} = require('browser-sync');
const {join, dirname} = require('path');
const {Logger} = require('eazy-logger');
const {Gaze} = require('gaze');
const {TwingExtensionDebug, TwingLoaderRelativeFilesystem, TwingLoaderFilesystem, TwingLoaderChain} = require('twing');

let logger = new Logger({});

/**
 * @type {ComponentCompound[]}
 */
let components = [
    new ComponentCompound('Field/field', [
        new ComponentFilesystem('twig', 'test/Field/field/demo.html.twig'),
        new ComponentFilesystem('sass', 'test/Field/field/demo.scss'),
        new ComponentFilesystem('js', 'test/Field/field/demo.js'),
    ])
];

let jobDefinitions = new Map([
    ['twig', {
        /**
         * @param {ComponentFilesystem} component
         * @returns {Job}
         */
        jobFactory: (component) => {
            let filesystemLoader = new TwingLoaderFilesystem();

            filesystemLoader.addPath('src', 'Src');
            filesystemLoader.addPath('test', 'Test');

            return new Job('Twig', [
                new TaskTwing('render', {
                    loader: new TwingLoaderChain([
                        filesystemLoader,
                        new TwingLoaderRelativeFilesystem(),
                    ]),
                    extensions: new Map([
                        ['debug', new TwingExtensionDebug()]
                    ]),
                    options: {
                        cache: join('tmp/twig', component.path),
                        debug: true,
                        auto_reload: true
                    }
                })
            ])
        },
        output: 'index.html'
    }],
    ['sass', {
        /**
         * @param {ComponentFilesystem} component
         * @returns {Job}
         */
        jobFactory: (component) => new Job('Stylesheet', [
            new TaskSass('sass', {
                precision: 8,
                outFile: 'index.css',
                includePaths: [
                    dirname(component.path)
                ]
            })
        ]),
        output: 'index.css'
    }],
    ['js', {
        /**
         * @param {ComponentFilesystem} component
         * @returns {Job}
         */
        jobFactory: (component) => new Job('JavaScript', [
            new TaskBrowserify('browserify', {
                basedir: dirname(component.path)
            })
        ]),
        output: 'index.js'
    }],
]);

/**
 * @type {Map<Component, Gaze>}
 */
let watchers = new Map();

/**
 * @param {ComponentCompound} component
 * @param {ComponentFilesystem} subComponent
 * @returns {Promise<State[]>}
 */
let buildComponent = (component, subComponent = null) => {
    if (!subComponent) {
        let promises = [];

        for (let subComponent of component) {
            promises.push(buildComponent(component, subComponent));
        }

        return Promise.all(promises);
    }
    else {
        /**
         * @type {Gaze}
         */
        let watcher;

        if (watchers.has(subComponent)) {
            watcher = watchers.get(subComponent);
        }

        if (watcher) {
            watcher.close();
        }

        let jobDefinition = jobDefinitions.get(subComponent.name);

        let job = jobDefinition.jobFactory(subComponent);
        let output = jobDefinition.output;

        return subComponent.initialState
            .then((state) => {
                return job.run(state)
                    .then((states) => {
                        return [state].concat(states);
                    })
            })
            .then((states) => {
                let state = states[states.length - 1];

                return new Promise((resolve, reject) => {
                    outputFile(join('www', component.name, output), state.data, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(states);
                        }
                    });
                });
            })
            .then((states) => {
                let dependencies = [];

                for (let state of states) {
                    for (let dependency of state.dependencies) {
                        dependencies.push(dependency);
                    }
                }

                watcher = new Gaze(dependencies).on('changed', () => {
                    buildComponent(component, subComponent)
                        .then(() => {
                            let bs = hasBrowserSync(component.name) ? getBrowserSync(component.name) : null;

                            if (bs) {
                                logger.unprefixed('info', 'Reloading ' + output);

                                bs.reload(output);
                            }
                        });
                });

                watchers.set(subComponent, watcher);
            });
    }
};

for (let component of components) {
    let componentName = component.name;

    let browserSync = createBrowserSync(componentName);
    let browserSyncConfig = {
        server: join('www', componentName),
        ui: false,
        open: false,
        notify: false,
        logLevel: 'silent'
    };

    let browserSyncInit = new Promise(function (resolve, reject) {
        browserSync.init(browserSyncConfig, function (err, bs) {
            if (err) {
                reject(err);
            } else {

                let urls = bs.options.get("urls");

                let maxLength = 0;

                let name = componentName;
                let localURL = urls.get('local');
                let message = name + localURL;

                maxLength = Math.max(maxLength, message.length);

                maxLength += 2;

                logger.unprefixed('info', '{bold: Access URLs:}');
                logger.unprefixed('info', '{grey: %s}', '-'.repeat(maxLength));
                logger.unprefixed('info', ' %s: {bold:%s}', localURL, name);
                logger.unprefixed('info', '{grey: %s}', '-'.repeat(maxLength));

                resolve(bs);
            }
        });
    });

    browserSyncInit.then(() => buildComponent(component));
}
