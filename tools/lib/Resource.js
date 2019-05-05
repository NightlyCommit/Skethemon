class Resource {
    /**
     * @param {string} source
     * @param {string|null} destination
     */
    constructor(source, destination = null) {
        this._source = source;
        this._destination = destination;
    }

    get source() {
        return this._source;
    }

    get destination() {
        return this._destination;
    }
}

exports.Resource = Resource;
