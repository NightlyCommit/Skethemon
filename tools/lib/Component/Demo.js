const {ComponentFilesystem} = require('../vendor/Component/Filesystem');
const {State} = require('../vendor/State');
const {resolve: resolvePath} = require('path');

class ComponentDemo extends ComponentFilesystem {
    initialState(name = null) {
        let data;

        if (name === 'twig') {
            data = `{{ include("${resolvePath(this.path)}", ${this.name}) }}`;
        }

        return Promise.resolve(new State(this.name, data ? data : ''));
    }
}

exports.ComponentDemo = ComponentDemo;
