const {Component} = require ('../Component');

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
}

exports.ComponentCompound = ComponentCompound;