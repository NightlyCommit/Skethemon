const {Component} = require('../Component');
const {State} = require('../State');
const {resolve: resolvePath} = require('path');

class ComponentDemo extends Component {
    /**
     * @param {string} path
     * @param {ComponentInterface} component
     */
    constructor(path, component) {
        super(component.name);

        /**
         * @type {ComponentInterface}
         * @private
         */
        this._component = component;

        /**
         * @type {string}
         * @private
         */
        this._path = path;
    }

    /**
     * @returns {ComponentInterface}
     */
    get component() {
        return this._component;
    }

    initialState(name = null) {
        if (name === 'twig') {
            return Promise.resolve(
                new State(this.name, `{{ include("${resolvePath(this._path)}", ${this.fqn('.')}) }}`)
            );
        }
        else {
            return Promise.resolve(new State(this.name, ''));
        }
    }

    data() {
        return this.component.data()
            .then((data) => {
                console.warn('DEMO DATA', data);

                return {
                    title: this.component.fqn(),
                    timestamp: new Date().getTime(),
                    language: 'en',
                    direction: 'ltr',
                    children: data
                };
            });
    }
}

exports.ComponentDemo = ComponentDemo;
