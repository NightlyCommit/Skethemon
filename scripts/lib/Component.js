const {State} = require('./State');

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
    get initialState() {
        return Promise.resolve(new State(this.name, null));
    }
}

exports.Component = Component;
