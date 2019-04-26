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

        /**
         * @type {State[]}
         * @private
         */
        this._states = null;
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
     * @returns {State[]}
     */
    get states() {
        return this._states;
    }

    /**
     * @param {State[]} states
     */
    set states(states) {
        this._states = states;
    }

    /**
     * @returns {string}
     */
    get fqn() {
        return join(this.parent ? this.parent.fqn : '', this.name);
    }

    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        return Promise.resolve(new State(this.name, null));
    }

    data() {
        return Promise.resolve({});
    }

    /**
     * @returns {IterableIterator<Component>}
     */
    [Symbol.iterator]() {
        return [].values();
    }
}

exports.Component = Component;
