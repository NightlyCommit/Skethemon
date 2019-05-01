/**
 * @class
 */
class State {
    /**
     * @param {string} name
     * @param {*} data
     * @param {Buffer} map
     */
    constructor(name, data, map = null) {
        this._name = name;
        this._data = data;
        this._map = map;
    }

    get name() {
        return this._name;
    }

    get data() {
        return this._data;
    }

    get map() {
        return this._map;
    }
}

exports.State = State;
