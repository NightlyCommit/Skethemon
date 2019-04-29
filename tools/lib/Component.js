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
     * @returns {ComponentInterface[]}
     */
    get children() {
        return this._children;
    }

    /**
     * @returns {string}
     */
    fqn(separator = '/') {
        let components = [];

        components.push(this.name);

        return components.join(separator);
    }

    /**
     * @param {string|null} name
     * @return {Promise<State>}
     */
    initialState(name = null) {
        return Promise.resolve(new State(this.name, ''));
    };

    /**
     * @return {Promise<*>}
     */
    data() {
        return Promise.resolve({});
    };
}

exports.Component = Component;
