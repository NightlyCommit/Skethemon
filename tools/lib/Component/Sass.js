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
        let data;

        console.warn('INIT', name);

        if (name === 'sass') {
            data = `@import "${pathResolve(this.path)}";`;
        }

        return  Promise.resolve(data ? new State(this.name, data, null) : null);
    }
}

exports.ComponentSass = ComponentSass;
