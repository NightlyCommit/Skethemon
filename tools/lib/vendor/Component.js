const {State} = require('./State');

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
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @param {string|null} name
     * @return {Promise<State>}
     */
    initialState(name = null) {
        return Promise.resolve();
    };

    /**
     * @return {Promise<*>}
     */
    data() {
        return Promise.resolve();
    };
}

exports.Component = Component;
