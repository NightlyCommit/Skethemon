const {Component} = require('../Component');
const {State} = require('../State');

/**
 * @implements IterableIterator
 */
class ComponentCompound extends Component {
    /**
     * @param {string} name
     * @param {Component[]} components
     */
    constructor(name, components) {
        super(name);

        /**
         * @type {Map<string, Component>}
         * @private
         */
        this._components = new Map();

        for (let component of components) {
            component.parent = this;

            this._components.set(component.name, component);
        }
    }

    /**
     * @returns {Map<string, Component>}
     */
    get components() {
        return this._components;
    }

    /**
     * @param name
     * @returns {Component}
     */
    getComponent(name) {
        return this._components.has(name) ? this._components.get(name) : null;
    }

    /**
     * @returns {IterableIterator<Component>}
     */
    [Symbol.iterator]() {
        return this.components.values();
    }

    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        let states = [];

        let promises = [...this.components.values()].map((component) => {
            return component.initialState(name);
        });

        return promises.reduce((accumulator, next) => {
            return accumulator
                .then(() => {
                    return next
                })
                .then((state) => {
                    states.push(state);
                });
        }, Promise.resolve())
            .then(() => {
                let stateData = '';

                for (let state of states) {
                    if (!name || (state.name === name)) {
                        stateData += state.data;
                    }
                }

                return new State(name ? name : this.name, stateData, null);
            });
    }

    data() {
        let data = new Map();

        let promises = [...this.components.values()].map((component) => {
            return component.data()
                .then((componentData) => {
                    data.set(component.name, componentData);
                });
        });

        return promises.reduce((accumulator, next) => {
            return accumulator
                .then(() => {
                    return next
                })
        }, Promise.resolve())
            .then(() => {
                return {
                    children: data
                };
            });
    }
}

exports.ComponentCompound = ComponentCompound;
