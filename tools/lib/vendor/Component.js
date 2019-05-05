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
     * @param {Function} addDependency
     * @return {Promise<State>}
     */
    initialState(name = null, addDependency = null) {
        return Promise.resolve();
    };

    /**
     * @param {string|null} name
     * @param {Function} addDependency
     * @return {Promise<*>}
     */
    data(name = null, addDependency = null) {
        return Promise.resolve();
    };
}

exports.Component = Component;
