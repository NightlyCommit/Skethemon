const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: resolvePath} = require('path');
const {getSlug} = require('../getSlug');

class ComponentDemo extends ComponentFilesystem {
    initialState(name = null) {
        let state;

        if (name === 'twig') {
            state = new State(this.name, `{{ include("${resolvePath(this.path)}", ${getSlug(this.name)}) }}`);
        }

        return Promise.resolve(state);
    }
}

exports.ComponentDemo = ComponentDemo;
