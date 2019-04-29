const {Component} = require('../Component');
const {resolve: resolvePath} = require('path');
const {stat} = require('fs');
const requireUncached = require('require-uncached');

class ComponentTestDemo extends Component {
    /**
     * @param {string} template
     * @param {string} dataModulePath
     */
    constructor(name, template, dataModulePath) {
        super(name);

        this._path = 'tools/test-demo.html.twig';
        this._template = template;
        this._name = name;

        /**
         * @type {string}
         * @private
         */
        this._dataModulePath = dataModulePath;
    }

    get dataModulePath() {
        return this._dataModulePath;
    }

    get template() {
        return this._template;
    }

    get path() {
        return this._path;
    }

    data() {
        return new Promise((resolve, reject) => {
            let data = {
                cases: [],
                title: this.fqn(),
                template: resolvePath(this.template),
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

exports.ComponentTestDemo = ComponentTestDemo;
