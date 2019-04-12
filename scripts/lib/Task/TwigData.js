const {Task} = require('../Task');
const {State} = require('../State');
const path = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');
const ModuleDeps = require('module-deps');

class TaskTwigData extends Task {
    /**
     * @param {string} name
     * @param {*} config
     */
    constructor(name, config) {
        super(name);

        /**
         * @type {*}
         * @private
         */
        this._config = config;
    }

    /**
     * @param {State} state
     */
    run(state) {
        let file = path.resolve(this._config.path);

        return Promise.all([
            this.getDataDependencies(file),
            this.getData(file)
        ]).then(([dependencies, data]) => {
            return [
                new State('data', state.data, state.map, dependencies)
            ];
        });
    }

    /**
     *
     * @param file
     * @returns {Promise.<{}>}
     */
    getData(file) {
        return new Promise((resolve, reject) => {
            stat(file, (err, stats) => {
                if (err) {
                    resolve(null);
                } else {
                    let data;

                    try {
                        data = requireUncached(file)(requireUncached);
                    } catch (err) {
                        reject({
                            file: file,
                            message: err
                        });
                    }

                    return Promise.resolve(data).then(
                        (data) => {
                            resolve(data);
                        }
                    );
                }
            });
        });
    }

    getDataDependencies(file) {
        return new Promise((resolve, reject) => {
            let depper = ModuleDeps({ignoreMissing: true});

            let dependencies = [];

            let updateDependencies = (dep) => {
                if (dependencies.indexOf(dep) < 0) {
                    dependencies.push(dep);
                }
            };

            depper.on('file', (file) => {
                updateDependencies(file);
            });

            depper.on('data', (data) => {
                let file = data.id;

                updateDependencies(file);
            });

            depper.on('missing', (id, parent) => {
                if (path.extname(id).length === 0) {
                    let candidates = [
                        `${id}.js`,
                        `${id}/index.js`
                    ];

                    for (let candidate of candidates) {
                        dependencies.push(path.resolve(parent.basedir, candidate));
                    }
                } else {
                    dependencies.push(path.resolve(parent.basedir, id));
                }
            });

            depper.on('end', () => {
                resolve(dependencies);
            });

            depper.on('error', (err) => {
                resolve(dependencies);
            });

            depper.end({
                file: file,
                entry: true
            });
        })
    };
}

exports.TaskTwigData = TaskTwigData;
