const {readFile} = require('fs');
const {Component} = require('../Component');
const {State} = require('../State');

/**
 * @class
 */
class ComponentFilesystem extends Component {
    constructor(name, path) {
        super(name);

        this._path = path;
    }

    get path() {
        return this._path;
    }

    /**
     * @param {string|null} name
     * @param {Function} addDependency
     * @returns {Promise<State>}
     */
    initialState(name = null, addDependency = null) {
        return new Promise((resolve, reject) => {
            readFile(this._path, 'UTF-8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new State(this.name, data, null));
                }
            });
        });
    }
}

exports.ComponentFilesystem = ComponentFilesystem;
