const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: resolvePath} = require('path');

/**
 * @class
 */
class ComponentTwig extends ComponentFilesystem {
    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        let state;

        if (name === 'twig') {
            state = new State(this.name, `{{ include("${resolvePath(this.path)}") }}`);
        }

        return Promise.resolve(state);
    }

}

exports.ComponentTwig = ComponentTwig;
