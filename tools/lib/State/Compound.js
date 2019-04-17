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
     * @returns {State}
     */
    getState(name) {
        return this._states.has(name) ? this._states.get(name) : null;
    }

    /**
     * @returns {IterableIterator<State>}
     */
    [Symbol.iterator]() {
        return this.states.values();
    }
}

exports.StateCompound = StateCompound;
