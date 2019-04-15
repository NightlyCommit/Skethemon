const {Component} = require ('../Component');
const {StateCompound} = require ('../State/Compound');

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
     * @returns {*}
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
     * @returns {Promise<State>}
     */
    initialState() {
        let promises = [];

        for (let component of this) {
            promises.push(component.initialState())
        }

        return Promise.all(promises)
            .then((states) => {
                return new StateCompound(this.name, states);
            });
    }
}

exports.ComponentCompound = ComponentCompound;
