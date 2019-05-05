const {ComponentDemo} = require('../Demo');
const {resolve: resolvePath, extname: pathExtname} = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');
const moduleDeps = require('module-deps');

class ComponentDemoTest extends ComponentDemo {
    /**
     * @param {ComponentFilesystem} component
     * @param {string} dataModulePath
     */
    constructor(component, dataModulePath) {
        super(component.name, 'tools/demo/test.html.twig');

        /**
         * @type {ComponentFilesystem}
         * @private
         */
        this._component = component;

        /**
         * @type {string}
         * @private
         */
        this._dataModulePath = dataModulePath;
    }

    /**
     * @returns {ComponentFilesystem}
     */
    get component() {
        return this._component;
    }

    get dataModulePath() {
        return this._dataModulePath;
    }

    /**
     * @param {string} name
     * @param {Function} addDependency
     * @returns {Promise<*>}
     */
    data(name = null, addDependency = null) {
        if (name === 'twig') {
            let promises = [
                this.getModuleDependencies(this.dataModulePath),
                new Promise((resolve, reject) => {
                    let data = {
                        cases: [],
                        case_template: resolvePath(this.component.path),
                        title: this.name,
                        template: resolvePath(this.path),
                    };

                    stat(this.dataModulePath, (err) => {
                        if (err) {
                            resolve(data);
                        } else {
                            let cases;

                            try {
                                cases = requireUncached(resolvePath(this.dataModulePath))(requireUncached);
                            } catch (err) {
                                reject({
                                    file: this.dataModulePath,
                                    message: err
                                });
                            }

                            return Promise.resolve(cases).then(
                                (cases) => {
                                    data.cases = cases;

                                    resolve(data);
                                }
                            );
                        }
                    });
                })
            ];

            return Promise.all(promises)
                .then(([dependencies, data]) => {
                    if (addDependency) {
                        for (let dependency of dependencies) {
                            addDependency(dependency);
                        }
                    }

                    return data;
                });
        }
        else {
            return Promise.resolve();
        }
    }

    /**
     * @param {string} file
     * @returns {Promise<Array<string>>}
     */
    getModuleDependencies(file) {
        return new Promise((resolve, reject) => {
            let depper = moduleDeps({ignoreMissing: true});

            let sources = [];

            let updateSources = (dep) => {
                if (sources.indexOf(dep) < 0) {
                    sources.push(dep);
                }
            };

            depper.on('file', (file) => {
                updateSources(file);
            });

            depper.on('data', (data) => {
                let file = data.id;

                updateSources(file);
            });

            depper.on('missing', (id, parent) => {
                if (pathExtname(id).length === 0) {
                    let candidates = [
                        `${id}.js`,
                        `${id}/index.js`
                    ];

                    for (let candidate of candidates) {
                        sources.push(resolvePath(parent.basedir, candidate));
                    }
                } else {
                    sources.push(resolvePath(parent.basedir, id));
                }
            });

            depper.on('end', () => {
                resolve(sources);
            });

            depper.on('error', (err) => {
                resolve(sources);
            });

            depper.end({
                file: file,
                entry: true
            });
        })
    };
}

exports.ComponentDemoTest = ComponentDemoTest;
