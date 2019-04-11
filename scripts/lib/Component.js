const {State} = require('./State');

class Component {
    /**
     * @param {Source} source
     */
    constructor(name) {
        this._name = name;
        this._states = [];
    }

    get name() {
        return this._name;
    }

    get states() {
        return this._states;
    }

    /**
     * @returns {Promise<State>}
     */
    get initialState() {
        return null;
    }

    addState(name, data, map = null, dependencies = null) {
        this._states.push(new State(name, data, map, dependencies));
    }
}

exports.Component = Component;