const {Component} = require('./lib/Component');
const {ComponentFilesystem} = require('./lib/Component/Filesystem');
const {ComponentCompound} = require('./lib/Component/Compound');
const {Job} = require('./lib/Job');
const {Task} = require('./lib/Task');
const {TaskTwing} = require('./lib/Task/Twing');
const {TaskSass} = require('./lib/Task/Sass');
const {outputFile} = require('fs-extra');
const {create: createBrowserSync, has: hasBrowserSync, get: getBrowserSync} = require('browser-sync');
const {join} = require('path');
const {Logger} = require('eazy-logger');
const {Gaze} = require('gaze');

let logger = new Logger({});

/**
 * @type {ComponentCompound[]}
 */
let components = [
    new ComponentCompound('Field/field', [
        new ComponentFilesystem('twig', 'test/Field/field/demo.html.twig'),
        new ComponentFilesystem('sass', 'test/Field/field/demo.scss'),
    ])
];

/**
 * @type {Map<Component, Gaze>}
 */
let watchers = new Map();

let twingJob = new Job('JOB 1', [
    new Job('JOB 2', [
        new Task('pre 1'),
        new Task('pre 2'),
        new Task('pre 3'),
        new Task('pre 4'),
        new Task('pre 5')
    ]),
    new TaskTwing('twig'),
    new Task('post 1'),
    new Task('post 2'),
    new Task('post 3'),
    new Task('post 4')
]);

let sassJob = new Job('Stylesheet', [
    new TaskSass('sass')
]);

/**
 * @param {ComponentCompound} component
 * @returns {Promise<State[]>}
 */
let buildComponent = (component, name, job, output) => {
    let subComponent = component.getComponent(name);

    // close watcher
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

            // for (let dependency of dependencies) {
            //     logger.unprefixed('info', '>>> ' + dependency);
            // }

            watcher = new Gaze(dependencies).on('changed', () => {
                buildComponent(component, name, job, output)
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

    browserSyncInit
        .then(() => {
            return Promise.all([
                buildComponent(component, 'twig', twingJob, 'index.html'),
                buildComponent(component, 'sass', sassJob, 'index.css')
            ])
        });
}
