const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: resolvePath} = require('path');

/**
 * @class
 */
class ComponentJavaScript extends ComponentFilesystem {
    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        let state;

        if (name === 'js') {
            state = new State(this.name, `require('${resolvePath(this.path)}');`, null);
        }

        return Promise.resolve(state);
    }
}

exports.ComponentJavaScript = ComponentJavaScript;
