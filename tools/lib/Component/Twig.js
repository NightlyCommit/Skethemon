const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
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
        return new Promise((resolve) => {
            if (name === 'twig') {
                resolve(new State(this.name, `{{ include("${resolvePath(this.path)}") }}`));
            }
            else {
                resolve(null);
            }
        });
    }

}

exports.ComponentTwig = ComponentTwig;
