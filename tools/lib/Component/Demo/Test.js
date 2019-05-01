const {ComponentDemo} = require('../Demo');
const {resolve: resolvePath} = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');

class ComponentDemoTest extends ComponentDemo {
    /**
     * @param {string} name
     * @param {string} template
     * @param {string} dataModulePath
     */
    constructor(name, template, dataModulePath) {
        super(name, 'tools/demo/test.html.twig');

        /**
         * @type {string}
         * @private
         */
        this._template = template;

        /**
         * @type {string}
         * @private
         */
        this._dataModulePath = dataModulePath;
    }

    get template() {
        return this._template;
    }

    get dataModulePath() {
        return this._dataModulePath;
    }

    data() {
        return new Promise((resolve, reject) => {
            let data = {
                cases: [],
                case_template: resolvePath(this.template),
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
