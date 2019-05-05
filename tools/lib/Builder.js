const {outputFile, copy} = require('fs-extra');
const {join} = require('path');
const {Resource, ResourceType} = require('../lib/Resource');
const {Logger} = require('eazy-logger');
const {inspect} = require('util');
const {getSlug} = require('./getSlug');

class Builder {
    /**
     * @param {Job} job
     * @param {Map<string, string>} outputDefinitions
     */
    constructor(job, outputDefinitions) {
        /**
         * @type {Job}
         * @private
         */
        this._job = job;

        /**
         * @type {Map<string, string>}
         * @private
         */
        this._outputDefinitions = outputDefinitions;

        /**
         * @type {Logger}
         * @private
         */
        this._logger = new Logger({});
    }

    /**
     * @returns {Job}
     */
    get job() {
        return this._job;
    }

    /**
     * @returns {Map<string, string>}
     */
    get outputDefinitions() {
        return this._outputDefinitions;
    }

    /**
     * @returns {Logger}
     */
    get logger() {
        return this._logger;
    }

    /**
     * @param {ComponentInterface} component
     * @param {Task} task
     * @return {Promise<Resource[]>}
     */
    buildComponentWithTask(component, task) {
        let output = this.outputDefinitions.get(task.name);
        let www = join('www', component.name);

        /**
         * @type {Resource[]}
         */
        let dependencies = [];

        let addDependency = (source, destination = null) => {
            dependencies.push(new Resource(source, destination));
        };

        let stateAndDataPromises = [
            component.initialState(task.name, addDependency),
            component.data(task.name, addDependency)
        ];

        return Promise.all(stateAndDataPromises)
            .then(([state, data]) => {
                if (state) {
                    data = new Map([[getSlug(component.name, '__'), data]]);

                    return task.run(state, data, addDependency)
                        .then((states) => {
                            return [state].concat(states);
                        })
                } else {
                    return [];
                }
            })
            .then((states) => {
                let writePromises = [];

                // console.warn('LET US WRITE TO', job.name, www);

                /**
                 * @type {State}
                 */
                let state = states[states.length - 1];

                // console.warn('LAST STATE FOR', job.name, state.data.toString());

                let map = state.map;

                if (map) {
                    let mapObject = JSON.parse(map.toString());

                    for (let source of mapObject.sources) {
                        dependencies.push(new Resource(source));
                    }
                }

                for (let dependency of dependencies) {
                    if (dependency.destination) {
                        let dest = join(www, dependency.destination);

                        writePromises.push(new Promise((resolve) => {
                            copy(dependency.source, dest, () => {
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

                return Promise.all(writePromises)
                    .then(() => {
                        return dependencies;
                    });
            })
    }

    /**
     * @param {ComponentInterface} component
     */
    buildComponent(component) {
        // console.warn('WE BUILD ' + component.name + ' WITH JOB ' + this.job.name);

        return Promise.resolve()
            .then(() => {
                let promises = [];

                for (let task of this.job) {
                    promises.push(this.buildComponentWithTask(component, task));
                }

                return Promise.all(promises);
            });
    };
}

exports.Builder = Builder;
