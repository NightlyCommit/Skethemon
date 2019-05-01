const {Component} = require('../lib/vendor/Component');
const {ComponentDemoIndex} = require('../lib/Component/Demo/Index');
const {ComponentDemoTest} = require('../lib/Component/Demo/Test');
const {ComponentFilesystem} = require('../lib/vendor/Component/Filesystem');
const {ComponentCompound} = require('../lib/vendor/Component/Compound');
const {ComponentTwig} = require('../lib/Component/Twig');
const {ComponentSass} = require('../lib/Component/Sass');
const {ComponentJavaScript} = require('../lib/Component/JavaScript');
const {Job} = require('../lib/vendor/Job');
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
const {resolve: resolvePath} = require('path');

let logger = new Logger({});

/**
 * @type {Map<ComponentInterface, Resource[]>}
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
 * @type {Map<string, string>}
 */
let outputDefinitions = new Map([
    ['twig', 'index.html'],
    ['sass', 'index.css']
]);

/**
 * @type {Map<ComponentInterface, Map<Job, Gaze>>}
 */
let watchers = new Map();

/**
 * @param {ComponentInterface} component
 * @param {Job} job
 */
let buildComponentWithJob = (component, job) => {
    let output = outputDefinitions.get(job.name);
    let www = join('www', component.name);

    /**
     * @type {Gaze}
     */
    let watcher;
    let componentWatchers;

    if (!watchers.has(component)) {
        watchers.set(component, new Map());
    }

    componentWatchers = watchers.get(component);

    if (componentWatchers.has(job)) {
        watcher = componentWatchers.get(job);

        watcher.close();
    }

    console.warn('OUTPUT >>>', output);

    let stateAndDataPromises = [
        component.initialState(job.name),
        component.data()
    ];

    return Promise.all(stateAndDataPromises)
        .then(([state, data]) => {
            if (state) {
                return job.run(state, new Map([[component.name, data]]))
                    .then((states) => {
                        return [state].concat(states);
                    })
            } else {
                return [];
            }
        })
        .then((states) => {
            let writePromises = [];

            console.warn('LET US WRITE TO', job.name, www);

            /**
             * @type {Array<Resource>}
             */
            let componentResources = resources.has(component) ? resources.get(component) : [];
            let state = states[states.length - 1];

            console.warn('LAST STATE FOR', job.name, state.data.toString());

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
                /**
                 * @type {Array<Resource>}
                 */
                let componentResources = resources.has(component) ? resources.get(component) : [];

                return componentResources.map((resource) => resolvePath(resource.source));
            });
        })
        .then((sourcesToWatch) => {
            watcher = new Gaze(sourcesToWatch).on('changed', () => {
                buildComponentWithJob(component, job)
                    .then(() => {
                        let bs = hasBrowserSync(component.name) ? getBrowserSync(component.name) : null;

                        if (bs) {
                            logger.unprefixed('info', 'Reloading ' + output);

                            bs.reload(output);
                        }
                    });
            });

            componentWatchers.set(job, watcher);
        });
};

/**
 * @param {ComponentInterface} component
 * @param {Job} job
 */
let buildComponent = (component, job) => {
    console.warn('WE BUILD ' + component.name + ' WITH JOB ' + job.name);

    return Promise.resolve()
        .then(() => {
            let promises = [];

            for (let child of job) {
                promises.push(buildComponentWithJob(component, child));
            }

            return Promise.all(promises);
        });
};

let component = new ComponentCompound('Field', [
    new ComponentCompound('Field__field', [
        new ComponentDemoTest('Field > field', 'test/Field/field/index.html.twig', 'test/Field/field/test_cases.js'),
        new ComponentSass('Field > field', 'test/Field/field/index.scss'),
    ]),
    new ComponentCompound('Field__Formatter', [
        new ComponentCompound('Field__Formatter__image_formatter', [
            new ComponentDemoTest('Field > Formatter > image_formatter', 'test/Field/Formatter/image-formatter/index.html.twig', 'test/Field/Formatter/image-formatter/test_cases.js'),
            new ComponentSass('Field > Formatter > image_formatter', 'test/Field/Formatter/image-formatter/index.scss'),
        ]),
    ]),
    new ComponentCompound('Demo', [ // added dynamically
        new ComponentSass('Demo', 'tools/demo/index.scss')
    ])
]);

let filesystemLoader = new TwingLoaderFilesystem();

filesystemLoader.addPath('tools', 'Lib');
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
    })
]);

let sassJob = new Job('sass', [
    new TaskSass('render', {
        precision: 8,
        outFile: outputDefinitions.get('sass'),
        sourceMap: true,
        sourceMapEmbed: true
    }),
    // new TaskCssRebase('rebase', {
    //     rebase: (obj, done) => {
    //         // let resolved = obj.resolved;
    //         // let componentResources = resources.has(component) ? resources.get(component) : [];
    //         //
    //         // componentResources.push(new Resource(resolved.path));
    //         //
    //         // resources.set(component, componentResources);
    //
    //         done();
    //     }
    // })
]);

let job = new Job('demo', [
    twigJob,
    sassJob
]);

let browserSyncInit = (component) => new Promise((resolve, reject) => {
    let browserSync = createBrowserSync(component.name);
    let browserSyncConfig = {
        server: join('www', component.name),
        ui: false,
        open: false,
        notify: false,
        logLevel: 'silent'
    };

    browserSync.init(browserSyncConfig, (err, bs) => {
        if (err) {
            reject(err);
        } else {
            let urls = bs.options.get("urls");

            let maxLength = 0;

            let name = component.name;
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

component = new ComponentDemoIndex(component);

browserSyncInit(component)
    .then((bs) => {
        return buildComponent(component, job);
    });


// component = component;

// buildComponent(component.getChild('field'), twigJob, 'index.html');
// buildComponent(component, twigJob, 'super-index.html');
// buildComponent(new ComponentDemoIndex(component.getChild('Field__field')), job);
// buildComponent(new ComponentDemoIndex(component), twigJob);
//
// buildComponent(component, sassJob, 'index.css');

// app.getComponent('Field').initialState()
//     .then((state) => {
//         return job.run(state);
//     })
//     .then((state) => {
//         console.warn(state);
//     });
