const {State} = require('./State');

/**
 * @implements {ComponentInterface}
 */
class Component {
    /**
     * @param {string} name
     */
    constructor(name) {
        this._name = name;

        /**
         * @type {Array<State>}
         * @private
         */
        this._states = [];
    }

    get name() {
        return this._name;
    }

    /**
     * @returns {Array<State>}
     */
    get states() {
        return this._states;
    }

    /**
     * @returns {Promise<State>}
     */
    initialState() {
        return Promise.resolve(new State(this.name, null));
    }
}

exports.Component = Component;
