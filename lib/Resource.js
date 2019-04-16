let ResourceType = {
    COPY: 1,
    WATCH: 2
};

class Resource {
    /**
     * @param source
     * @param {number} type
     */
    constructor(source, type = ResourceType.COPY | ResourceType.WATCH) {
        this._source = source;
        this._type = type;
    }

    get source() {
        return this._source;
    }

    get type() {
        return this._type;
    }
}

exports.ResourceType = ResourceType;
exports.Resource = Resource;
