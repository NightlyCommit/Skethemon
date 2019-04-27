const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {resolve: pathResolve} = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');

/**
 * @class
 */
class ComponentTwig extends ComponentFilesystem {
    constructor(path, dataModulePath) {
        super('twig', path);

        this._dataModulePath = dataModulePath;
    }

    get dataModulePath() {
        return this._dataModulePath;
    }

    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        return new Promise((resolve) => {
            resolve(new State(this.name, `{% include "${this.path}" %}`));
        });
    }

    data() {
        return new Promise((resolve, reject) => {
            let data = {
                cases: [],
                title: this.parent.fqn,
                template: pathResolve(this.path)
            };

            stat(this.dataModulePath, (err) => {
                if (err) {
                    resolve(data);
                } else {
                    let cases;

                    try {
                        cases = requireUncached(pathResolve(this.dataModulePath))(requireUncached);
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
        });
    }
}

exports.ComponentTwig = ComponentTwig;
