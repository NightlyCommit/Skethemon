const {ComponentDemo} = require('../Demo');
const {resolve: resolvePath} = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');

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

    data() {
        return new Promise((resolve, reject) => {
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
        });
    }
}

exports.ComponentDemoTest = ComponentDemoTest;
