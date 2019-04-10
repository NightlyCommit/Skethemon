class Source {
    constructor(name, data) {
        this._name = name;
        this._data = data;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {*}
     */
    get data() {
        return this._data;
    }
}

exports.Source = Source;