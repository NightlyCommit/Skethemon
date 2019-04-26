const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {resolve: pathResolve} = require('path');

/**
 * @class
 */
class ComponentJavaScript extends ComponentFilesystem {
    constructor(path) {
        super('js', path);
    }

    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        return new Promise((resolve) => {
            resolve(new State(this.name, `require('${pathResolve(this.path)}');`, null));
        });
    }
}

exports.ComponentJavaScript = ComponentJavaScript;
