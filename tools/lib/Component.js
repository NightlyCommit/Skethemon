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
    }

    get name() {
        return this._name;
    }

    /**
     * @returns {Promise<State>}
     */
    initialState() {
        return Promise.resolve(new State(this.name, null));
    }
}

exports.Component = Component;
