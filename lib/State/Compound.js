const {State} = require ('../State');

/**
 * @implements IterableIterator
 */
class StateCompound extends State {
    /**
     * @param {string} name
     * @param {State[]} states
     */
    constructor(name, states) {
        super(name, null);

        /**
         * @type {Map<string, State>}
         * @private
         */
        this._states = new Map();

        for (let state of states) {
            this._states.set(state.name, state);
        }
    }

    /**
     * @returns {Map<string, State>}
     */
    get states() {
        return this._states;
    }

    /**
     * @param name
     * @returns {*}
     */
    getComponent(name) {
        return this._components.has(name) ? this._components.get(name) : null;
    }

    /**
     * @returns {IterableIterator<State>}
     */
    [Symbol.iterator]() {
        return this.states.values();
    }
}

exports.StateCompound = StateCompound;
