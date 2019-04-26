const {Component} = require('../lib/Component');
const {ComponentDemo} = require('../lib/Component/Demo');
const {ComponentFilesystem} = require('../lib/Component/Filesystem');
const {ComponentCompound} = require('../lib/Component/Compound');
const {ComponentTwig} = require('../lib/Component/Twig');
const {ComponentSass} = require('../lib/Component/Sass');
const {ComponentJavaScript} = require('../lib/Component/JavaScript');
const {Job} = require('../lib/Job');
const {TaskTwing} = require('../lib/Task/Twing');
const {TaskSass} = require('../lib/Task/Sass');
const {TaskCssRebase} = require('../lib/Task/CssRebase');
const {TaskBrowserify} = require('../lib/Task/Browserify');
const {outputFile, copy} = require('fs-extra');
const {create: createBrowserSync, has: hasBrowserSync, get: getBrowserSync} = require('browser-sync');
const {join, dirname, resolve, relative} = require('path');
const {Logger} = require('eazy-logger');
const {Gaze} = require('gaze');
const {TwingExtensionDebug, TwingLoaderRelativeFilesystem, TwingLoaderFilesystem, TwingLoaderChain} = require('twing/index');
const {ContextResolver} = require('../lib/ContextResolver');
const {TwingExtensionDrupal} = require('../lib/Twing/Extension/Drupal');
const {Resource, ResourceType} = require('../lib/Resource');
const rimraf = require('rimraf');
const {inspect} = require('util');

let logger = new Logger({});

/**
 * @type {Map<Component, Resource[]>}
 */
let resources = new Map();

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
                    file: component.name,
                    loader: new TwingLoaderChain([
                        filesystemLoader,
                        new TwingLoaderRelativeFilesystem(),
                    ]),
                    extensions: new Map([
                        ['debug', new TwingExtensionDebug()],
                        ['drupal', new TwingExtensionDrupal()]
                    ]),
                    environment_options: {
                        cache: join('tmp/twig', 'Field/field'),
                        debug: true,
                        auto_reload: true,
                        source_map: true,
                        autoescape: false
                    },
                    context_provider: ((file) => {
                        let contextResolver = new ContextResolver(file);

                        return Promise.all([
                            contextResolver.getSources(),
                            contextResolver.getContext()
                        ]).then(([sources, context]) => {
                            let componentResources = resources.has(component) ? resources.get(component) : [];

                            for (let source of sources) {
                                let resource = new Resource(relative('.', source), ResourceType.WATCH);

                                componentResources.push(resource);
                            }

                            resources.set(component, componentResources);

                            return {
                                test_cases: context
                            };
                        });
                    })(resolve(join('test/Field/field', 'test_cases.js')))
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
                    let componentResources = resources.has(component) ? resources.get(component) : [];

                    componentResources.push(new Resource(resolved.path));

                    resources.set(component, componentResources);

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
        return new Promise((resolve) => {
            rimraf(join('www', component.name), () => {
                let promises = [];

                for (let subComponent of component) {
                    promises.push(buildComponent(component, subComponent));
                }

                resolve(Promise.all(promises));
            });
        });
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

                /**
                 * @type {Array<Resource>}
                 */
                let componentResources = resources.has(subComponent) ? resources.get(subComponent) : [];
                let state = states[states.length - 1];
                let map = state.map;

                if (map) {
                    let mapObject = JSON.parse(map.toString());

                    for (let source of mapObject.sources) {
                        componentResources.push(new Resource(source));
                    }
                }

                resources.set(subComponent, componentResources);

                for (let resource of componentResources) {
                    if (resource.type & ResourceType.COPY) {
                        let dest = join('www', component.name, resource.source);

                        writePromises.push(new Promise((resolve) => {
                            copy(resource.source, dest, () => {
                                resolve();
                            });
                        }));
                    }
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

                return Promise.all(writePromises).then(() => {
                    return states;
                });
            })
            .then(() => {
                /**
                 * @type {Array<Resource>}
                 */
                let componentResources = resources.has(subComponent) ? resources.get(subComponent) : [];

                let sourcesToWatch = componentResources.map((resource) => resource.source);

                watcher = new Gaze(sourcesToWatch).on('changed', () => {
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

/**
 * @param {ComponentCompound} component
 */
let buildABetterComponent = (component) => {
    console.warn('buildABetterComponent', component.name);

    let www = join('www', component.fqn);

    return new Promise((resolve) => {
        rimraf(www, () => {
            // let promises = [];

            // for (let child of component) {
            //     promises.push(buildABetterComponent(child));
            // }

            return Promise.resolve()
                .then((results) => {
                    console.warn('WE BUILD ' + component.fqn);

                    /**
                     * @type {Gaze}
                     */
                    let watcher;

                    if (watchers.has(component)) {
                        watcher = watchers.get(component);
                    }

                    if (watcher) {
                        watcher.close();
                    }

                    let jobDefinition = jobDefinitions.get(component.name);

                    if (jobDefinition) {
                        let job = jobDefinition.jobFactory(component);
                        let output = jobDefinition.output;

                        return component.initialState()
                            .then((state) => {
                                return component.data()
                                    .then((data) => {
                                        return job.run(state, data)
                                            .then((states) => {
                                                return [state].concat(states);
                                            })
                                    });
                            })
                            .then((states) => {
                                let writePromises = [];

                                console.warn('LET US WRITE TO', www);

                                /**
                                 * @type {Array<Resource>}
                                 */
                                let componentResources = resources.has(component) ? resources.get(component) : [];
                                let state = states[states.length - 1];
                                let map = state.map;

                                if (map) {
                                    let mapObject = JSON.parse(map.toString());

                                    for (let source of mapObject.sources) {
                                        componentResources.push(new Resource(source));
                                    }
                                }

                                resources.set(component, componentResources);

                                for (let resource of componentResources) {
                                    if (resource.type & ResourceType.COPY) {
                                        let dest = join(www, resource.source);

                                        writePromises.push(new Promise((resolve) => {
                                            copy(resource.source, dest, () => {
                                                resolve();
                                            });
                                        }));
                                    }
                                }

                                writePromises.push(new Promise((resolve, reject) => {
                                    outputFile(join(www, output), state.data, (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve();
                                        }
                                    });
                                }));

                                return Promise.all(writePromises).then(() => {
                                    return states;
                                });
                            })
                            .then(() => {
                                /**
                                 * @type {Array<Resource>}
                                 */
                                let componentResources = resources.has(component) ? resources.get(component) : [];

                                let sourcesToWatch = componentResources.map((resource) => resource.source);

                                watcher = new Gaze(sourcesToWatch).on('changed', () => {
                                    buildABetterComponent(component)
                                        .then(() => {
                                            let bs = hasBrowserSync(component.parent.fqn) ? getBrowserSync(component.parent.fqn) : null;

                                            if (bs) {
                                                logger.unprefixed('info', 'Reloading ' + output);

                                                bs.reload(output);
                                            }
                                        });
                                });

                                watchers.set(component, watcher);
                            });
                    } else {
                        return Promise.resolve();
                    }
                });
        });
    });
};

let initPromises = [];

let component = new ComponentCompound('Field', [
    new ComponentCompound('field', [
        new ComponentTwig('twig', 'test/Field/field/index.html.twig', 'test/Field/field/test_cases.js'),
        new ComponentSass('sass', 'test/Field/field/index.scss')
    ]),
    new ComponentCompound('Formatter', [
        new ComponentCompound('image_formatter', [
            new ComponentTwig('twig', 'test/Field/Formatter/image-formatter/index.html.twig', 'test/Field/Formatter/image-formatter/test_cases.js'),
            new ComponentSass('sass', 'test/Field/Formatter/image-formatter/index.scss')
        ]),
    ])
]);

let demoComponent = new ComponentDemo('Demo', component);

for (let component of [
    demoComponent
]) {
    let componentName = component.fqn;

    let browserSync = createBrowserSync(componentName);
    let browserSyncConfig = {
        server: join('www', componentName),
        ui: false,
        open: false,
        notify: false,
        logLevel: 'silent'
    };

    console.warn(browserSyncConfig);

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
    }).then(() => buildABetterComponent(component));

    initPromises.push(browserSyncInit);
}

let filesystemLoader = new TwingLoaderFilesystem();

filesystemLoader.addPath('src', 'Src');
filesystemLoader.addPath('test', 'Test');

let twigJob = new Job('twig', [
    new TaskTwing('render', {
        file: 'Field/index.html.twig', //component.name,
        loader: new TwingLoaderChain([
            filesystemLoader,
            new TwingLoaderRelativeFilesystem(),
        ]),
        extensions: new Map([
            ['debug', new TwingExtensionDebug()],
            ['drupal', new TwingExtensionDrupal()]
        ]),
        environment_options: {
            cache: join('tmp/twig', 'Field/field'),
            debug: true,
            auto_reload: true,
            source_map: true,
            autoescape: false
        },
        context_provider: ((file) => {
            let contextResolver = new ContextResolver(file);

            return Promise.all([
                contextResolver.getSources(),
                contextResolver.getContext()
            ]).then(([sources, context]) => {
                // let componentResources = resources.has(component) ? resources.get(component) : [];
                //
                // for (let source of sources) {
                //     let resource = new Resource(relative('.', source), ResourceType.WATCH);
                //
                //     componentResources.push(resource);
                // }

                // resources.set(component, componentResources);

                return {
                    test_cases: context
                };
            });
        })(resolve(join('test/Field/field', 'test_cases.js')))
    })
]);

let job = new Job('demo', [
    new Job('twig', [
        new TaskTwing('render', {
            file: 'Field/index.html.twig', //component.name,
            loader: new TwingLoaderChain([
                filesystemLoader,
                new TwingLoaderRelativeFilesystem(),
            ]),
            extensions: new Map([
                ['debug', new TwingExtensionDebug()],
                ['drupal', new TwingExtensionDrupal()]
            ]),
            environment_options: {
                cache: join('tmp/twig', 'Field/field'),
                debug: true,
                auto_reload: true,
                source_map: true,
                autoescape: false
            },
            context_provider: ((file) => {
                let contextResolver = new ContextResolver(file);

                return Promise.all([
                    contextResolver.getSources(),
                    contextResolver.getContext()
                ]).then(([sources, context]) => {
                    // let componentResources = resources.has(component) ? resources.get(component) : [];
                    //
                    // for (let source of sources) {
                    //     let resource = new Resource(relative('.', source), ResourceType.WATCH);
                    //
                    //     componentResources.push(resource);
                    // }

                    // resources.set(component, componentResources);

                    return {
                        test_cases: context
                    };
                });
            })(resolve(join('test/Field/field', 'test_cases.js')))
        })
    ]),
    new Job('sass', [
        new TaskSass('render', {
            precision: 8,
            file: 'index.scss', //resolve(component.path),
            outFile: 'index.css',
            sourceMap: true,
            sourceMapEmbed: true
        }),
        new TaskCssRebase('rebase', {
            rebase: (obj, done) => {
                // let resolved = obj.resolved;
                // let componentResources = resources.has(component) ? resources.get(component) : [];
                //
                // componentResources.push(new Resource(resolved.path));
                //
                // resources.set(component, componentResources);

                done();
            }
        })
    ]),
    new Job('js', [
        new TaskBrowserify('bundle', {
            basedir: 'src' //dirname(component.path)
        })
    ])
]);

buildABetterComponent(demoComponent);

// app.getComponent('Field').initialState()
//     .then((state) => {
//         return job.run(state);
//     })
//     .then((state) => {
//         console.warn(state);
//     });
