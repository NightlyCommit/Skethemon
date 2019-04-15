const {Component} = require('../lib/Component');
const {ComponentFilesystem} = require('../lib/Component/Filesystem');
const {ComponentCompound} = require('../lib/Component/Compound');
const {Job} = require('../lib/Job');
const {TaskTwing} = require('../lib/Task/Twing');
const {TaskSass} = require('../lib/Task/Sass');
const {TaskCssRebase} = require('../lib/Task/CssRebase');
const {TaskBrowserify} = require('../lib/Task/Browserify');
const {outputFile, copy} = require('fs-extra');
const {create: createBrowserSync, has: hasBrowserSync, get: getBrowserSync} = require('browser-sync');
const {join, dirname, resolve} = require('path');
const {Logger} = require('eazy-logger');
const {Gaze} = require('gaze');
const {TwingExtensionDebug, TwingLoaderRelativeFilesystem, TwingLoaderFilesystem, TwingLoaderChain} = require('twing');
const {ContextResolver} = require('../lib/ContextResolver');
const {TwingExtensionDrupal} = require('../lib/Twing/Extension/Drupal');

let logger = new Logger({});

/**
 * @type {ComponentCompound}
 */
let app = new ComponentCompound('App', [
    new ComponentCompound('Field', [
        new ComponentCompound('field', [
            new ComponentFilesystem('twig', 'test/Field/field/demo.html.twig'),
            new ComponentFilesystem('sass', 'test/Field/field/demo.scss'),
            new ComponentFilesystem('js', 'test/Field/field/demo.js'),
        ]),
        new ComponentCompound('Formatter', [
            new ComponentCompound('image-formatter', [
                new ComponentFilesystem('twig', 'test/Field/Formatter/image-formatter/demo.html.twig'),
                new ComponentFilesystem('sass', 'test/Field/Formatter/image-formatter/demo.scss'),
                new ComponentFilesystem('js', 'test/Field/Formatter/image-formatter/demo.js'),
            ])
        ])
    ])
]);

let app2 = new ComponentCompound('Field/field', [
    new ComponentFilesystem('twig', 'test/Field/field/demo.html.twig'),
    new ComponentFilesystem('sass', 'test/Field/field/demo.scss'),
    new ComponentFilesystem('js', 'test/Field/field/demo.js'),
]);

/**
 * @type {Map<Component, string[]>}
 */
let dataDependencies = new Map();

let assets = new Map();

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
                    file: component.path,
                    loader: new TwingLoaderChain([
                        filesystemLoader,
                        new TwingLoaderRelativeFilesystem(),
                    ]),
                    extensions: new Map([
                        ['debug', new TwingExtensionDebug()],
                        ['drupal', new TwingExtensionDrupal()]
                    ]),
                    environment_options: {
                        cache: join('tmp/twig', component.path),
                        debug: true,
                        auto_reload: true,
                        source_map: true,
                        autoescape: false
                    },
                    context_provider: ((file) => {
                        let contextResolver = new ContextResolver(file);

                        return Promise.all([
                            contextResolver.getDependencies(),
                            contextResolver.getContext()
                        ]).then(([dependencies, context]) => {
                            dataDependencies.set(component, dependencies);

                            return context;
                        });
                    })(resolve(join(dirname(component.path), 'data.js')))
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
                file: resolve(component.path),
                outFile: 'index.css',
                sourceMap: true,
                sourceMapEmbed: true
            }),
            new TaskCssRebase('rebase', {
                rebase: (obj, done) => {
                    let resolved = obj.resolved;

                    let componentAssets = assets.has(component) ? assets.get(component) : [];

                    componentAssets.push(resolved.path);

                    assets.set(component, componentAssets);

                    done();
                }
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

        // return component.initialState()
        //     .then((state) => {
        //         console.warn(util.inspect(component, {depth: null}));
        //     });
    } else {
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

        return subComponent.initialState()
            .then((state) => {
                return job.run(state)
                    .then((states) => {
                        return [state].concat(states);
                    })
            })
            .then((states) => {
                let writePromises = [];

                let state = states[states.length - 1];
                let map = state.map;

                if (map) {
                    let mapObject = JSON.parse(map.toString());

                    for (let source of mapObject.sources) {
                        let dest = join('www', component.name, source);

                        writePromises.push(new Promise((resolve, reject) => {
                            copy(source, dest, (err) => {
                                resolve(source);
                            });
                        }));
                    }
                }

                // ...
                let componentAssets = assets.has(subComponent) ? assets.get(subComponent) : [];

                for (let source of componentAssets) {
                    let dest = join('www', component.name, source);

                    writePromises.push(new Promise((resolve, reject) => {
                        copy(source, dest, (err) => {
                            resolve(source);
                        });
                    }));
                }

                writePromises.push(new Promise((resolve, reject) => {
                    outputFile(join('www', component.name, output), state.data, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }));

                return Promise.all(writePromises).then((ffff) => {
                    console.warn(ffff);

                    return states;
                });
            })
            .then((states) => {
                let dependencies = [];

                let state = states[states.length - 1];
                let map = state.map;

                if (map) {
                    let mapObject = JSON.parse(map.toString());

                    for (let source of mapObject.sources) {
                        dependencies.push(source);
                    }
                }

                let componentContextSources = dataDependencies.has(subComponent) ? dataDependencies.get(subComponent) : [];

                for (let contextSource of componentContextSources) {
                    dependencies.push(contextSource);
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

let initPromises = [];

for (let component of [app2]) {
    let componentName = component.name;

    let browserSync = createBrowserSync(componentName);
    let browserSyncConfig = {
        server: join('www', componentName),
        ui: false,
        open: false,
        notify: false,
        logLevel: 'silent'
    };

    let browserSyncInit = () => new Promise((resolve, reject) => {
        browserSync.init(browserSyncConfig, (err, bs) => {
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
    }).then(() => buildComponent(component));

    initPromises.push(browserSyncInit);
}

initPromises.reduce((previousValue, currentValue) => previousValue.then(() => currentValue()), Promise.resolve());
