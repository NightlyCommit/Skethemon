/**
 * @class
 * @implements IterableIterator
 */
class State {
    /**
     * @param {string} name
     * @param {*} data
     * @param {Buffer} map
     * @param {string[]} dependencies
     */
    constructor(name, data, map = null, dependencies = []) {
        this._name = name;
        this._data = data;
        this._map = map;
        this._dependencies = dependencies;
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

    get dependencies() {
        return this._dependencies;
    }
}

exports.State = State;
