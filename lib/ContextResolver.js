const path = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');
const ModuleDeps = require('module-deps');

class ContextResolver {
    /**
     * @param {string} file
     */
    constructor(file) {
        this._file = file;
    }

    /**
     * @returns {Promise<*>}
     */
    getContext() {
        let file = this._file;

        return new Promise((resolve, reject) => {
            stat(file, (err) => {
                if (err) {
                    resolve({});
                } else {
                    let data;

                    try {
                        data = requireUncached(file)(requireUncached);
                    } catch (err) {
                        console.warn(err);

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

    /**
     * @returns {Promise<Array<string>>}
     */
    getSources() {
        let file = this._file;

        return new Promise((resolve, reject) => {
            let depper = ModuleDeps({ignoreMissing: true});

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
                if (path.extname(id).length === 0) {
                    let candidates = [
                        `${id}.js`,
                        `${id}/index.js`
                    ];

                    for (let candidate of candidates) {
                        sources.push(path.l(parent.basedir, candidate));
                    }
                } else {
                    sources.push(path.resolve(parent.basedir, id));
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

exports.ContextResolver = ContextResolver;
