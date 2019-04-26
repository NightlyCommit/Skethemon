const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {resolve: pathResolve} = require('path');

/**
 * @class
 */
class ComponentSass extends ComponentFilesystem {
    constructor(path) {
        super('', path);
    }

    /**
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        return new Promise((resolve) => {
            resolve(new State(this.name, `@import "${pathResolve(this.path)}";`, null));
        });
    }
}

exports.ComponentSass = ComponentSass;
