const {readFile} = require('fs');
const {Component} = require('../Component');
const {State} = require('../State');

class ComponentFilesystem extends Component {
    constructor(name, path) {
        super(name);

        this._path = path;
    }

    get path() {
        return this._path;
    }

    /**
     * @returns {Promise<Source>}
     */
    get source() {
        return new Promise((resolve, reject) => {
            readFile(this._path, 'UTF-8', (err, data) => {
                if (err) {

                }
                else {
                    resolve(new Source(this._path, data));
                }
            });
        });
    }

    /**
     * @returns {Promise<State>}
     */
    get initialState() {
        return new Promise((resolve, reject) => {
            readFile(this._path, 'UTF-8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new State(this.name, data, null, [this.path]));
                }
            });
        });
    }
}

exports.ComponentFilesystem = ComponentFilesystem;