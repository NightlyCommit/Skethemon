const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: pathResolve} = require('path');

/**
 * @class
 */
class ComponentJavaScript extends ComponentFilesystem {
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
