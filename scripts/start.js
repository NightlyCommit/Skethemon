const {Component} = require('./lib/Component');
const {ComponentFilesystem} = require('./lib/Component/Filesystem');
const {Job} = require('./lib/Job');
const {Task} = require('./lib/Task');
const {TaskTwing} = require('./lib/Task/Twing');
const {outputFile} = require('fs-extra');
const {create: createBrowserSync, has: hasBrowserSync, get: getBrowserSync} = require('browser-sync');
const {join} = require('path');
const {Logger} = require('eazy-logger');
const {Gaze} = require('gaze');

let logger = new Logger({});

let components = [
    new ComponentFilesystem('Field/field', 'test/Field/field/demo.html.twig')
];

/**
 * @type {Map<Component, Gaze>}
 */
let watchers = new Map();

/**
 * @param {Component} component
 * @returns {Promise<State[]>}
 */
let buildComponent = (component) => {
    let job = new Job('JOB 1', [
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

    // close watcher
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

    return component.initialState
        .then((state) => {
            return job.run(state)
                .then((states) => {
                    return [state].concat(states);
                })
        })
        .then((states) => {
            let state = states[states.length - 1];

            return new Promise((resolve, reject) => {
                outputFile('www/Field/field/index.html', state.data, (err) => {
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

            for (let dependency of dependencies) {
                logger.unprefixed('info', dependency);
            }

            watcher = new Gaze(dependencies).on('changed', () => {
                buildComponent(component)
                    .then(() => {
                        let bs = hasBrowserSync(component.name) ? getBrowserSync(component.name) : null;

                        if (bs) {
                            logger.unprefixed('info', 'Reloading index.html');

                            bs.reload('index.html');
                        }
                    });
            });

            watchers.set(component, watcher);
        });
};

for (let component of components) {
    let browserSync = createBrowserSync(component.name);
    let browserSyncConfig = {
        server: join('www', component.name),
        ui: false,
        open: false,
        notify: false,
        logLevel: 'silent'
    };

    let browserSyncInit = new Promise(function (resolve) {
        browserSync.init(browserSyncConfig, function (err, bs) {
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
        });
    });

    browserSyncInit
        .then(() => {
            return buildComponent(component);
        });
}
