const {Builder} = require('../Builder');
const {create: createBrowserSync} = require('browser-sync');
const {join} = require('path');
const {Gaze} = require('gaze');
const {ResourceType} = require('../Resource');

class BuilderDevelopment extends Builder {
    constructor(job, outputDefinitions) {
        super(job, outputDefinitions);

        /**
         * @type {Map<ComponentInterface, Map<Task, Gaze>>}
         * @private
         */
        this._watchers = new Map();
    }

    /**
     * @returns {Map<ComponentInterface, Map<Job, Gaze>>}
     */
    get watchers() {
        return this._watchers;
    }

    /**
     * @param component
     * @returns {Promise<[*, Map<string, string>]>}
     */
    initBrowserSync(component) {
        return new Promise((resolve, reject) => {
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

                    resolve([browserSync, urls]);
                }
            });
        });
    }

    /**
     * @param {ComponentInterface} component
     */
    buildComponent(component) {
        console.warn('WE BUILD ' + component.name + ' WITH JOB ' + this.job.name);

        return this.initBrowserSync(component)
            .then(([browserSync, urls]) => {
                let promises = [];

                for (let task of this.job) {
                    let output = this.outputDefinitions.get(task.name);

                    /**
                     * @type {Gaze}
                     */
                    let watcher;
                    let componentWatchers;

                    if (!this.watchers.has(component)) {
                        this.watchers.set(component, new Map());
                    }

                    componentWatchers = this.watchers.get(component);

                    if (componentWatchers.has(task)) {
                        watcher = componentWatchers.get(task);

                        watcher.close();
                    }

                    let buildPromise = this.buildComponentWithTask(component, task)
                        .then((resources) => {
                            let toWatch = resources.map((resource) => {
                                return resource.source;
                            });

                            console.warn('T WATCH', toWatch, 'for', task.name);

                            watcher = new Gaze(toWatch).on('changed', (file) => {
                                this.logger.unprefixed('info', '{yellow:%s} did {bold:change} ', file);

                                this.buildComponentWithTask(component, task)
                                    .then(() => {
                                        this.logger.unprefixed('info', 'Reloading {yellow:%s}', output);

                                        browserSync.reload(output);
                                    });
                            });

                            componentWatchers.set(task, watcher);
                        });

                    promises.push(buildPromise);
                }

                return Promise.all(promises)
                    .then(() => {
                        let maxLength = 0;

                        let name = component.name;
                        let localURL = urls.get('local');
                        let message = name + localURL;

                        maxLength = Math.max(maxLength, message.length);

                        maxLength += 2;

                        this.logger.unprefixed('info', '{bold: Access URLs:}');
                        this.logger.unprefixed('info', '{grey: %s}', '-'.repeat(maxLength));
                        this.logger.unprefixed('info', ' %s: {bold:%s}', localURL, name);
                        this.logger.unprefixed('info', '{grey: %s}', '-'.repeat(maxLength));
                    });
            });
    };
}

exports.BuilderDevelopment = BuilderDevelopment;
