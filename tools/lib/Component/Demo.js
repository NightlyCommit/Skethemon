const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: resolvePath} = require('path');

class ComponentDemo extends ComponentFilesystem {
    initialState(name = null) {
        let state;

        if (name === 'twig') {
            state = new State(this.name, `{{ include("${resolvePath(this.path)}", ${this.name}) }}`);
        }

        return Promise.resolve(state);
    }
}

exports.ComponentDemo = ComponentDemo;
