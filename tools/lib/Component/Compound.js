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
         * @type {Component[]}
         * @private
         */
        this._components = components;

        for (let component of this) {
            component.parent = this;
        }
    }

    /**
     * @returns {Component[]}
     */
    get components() {
        return this._components;
    }

    /**
     * @param name
     * @returns {Component}
     */
    getComponent(name) {
        return this.components.find((item) => {
            return item.name === name;
        });
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
        let data = '';

        let promises = this.components.map((component) => {
            return component.initialState(name)
                .then((state) => {
                    if (!name || state.name === name) {
                        data += state.data;
                    }
                });
        });

        return promises.reduce((accumulator, next) => {
            return accumulator
                .then(() => {
                    return next
                })
        }, Promise.resolve())
            .then(() => {
                return new State(name ? name : this.name, data, null);
            });
    }

    data() {
        let data = new Map();

        let promises = this.components.map((component) => {
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
