const {State} = require('./State');
const {join} = require('path');

/**
 * @implements {ComponentInterface}
 */
class Component {
    /**
     * @param {string} name
     */
    constructor(name) {
        /**
         * @type {string}
         * @private
         */
        this._name = name;

        /**
         * @type {ComponentInterface}
         * @private
         */
        this._parent = null;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {ComponentInterface}
     */
    get parent() {
        return this._parent;
    }

    /**
     * @param {ComponentInterface} parent
     */
    set parent(parent) {
        this._parent = parent;
    }

    /**
     * @returns {string}
     */
    get fqn() {
        return join(this.parent ? this.parent.fqn : '', this.name);
    }

    /**
     * @returns {Promise<State>}
     */
    initialState() {
        return Promise.resolve(new State(this.name, null));
    }

    /**
     * @returns {IterableIterator<ComponentInterface>}
     */
    [Symbol.iterator]() {
        return [].values();
    }
}

exports.Component = Component;
