const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: pathResolve} = require('path');

/**
 * @class
 */
class ComponentSass extends ComponentFilesystem {
    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        let state;

        if (name === 'sass') {
            state = new State(this.name, `@import "${pathResolve(this.path)}";`);
        }

        return Promise.resolve(state);
    }
}

exports.ComponentSass = ComponentSass;
