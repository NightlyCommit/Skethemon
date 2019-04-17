const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing/index');

class ComponentDemo extends ComponentFilesystem {
    initialState() {
        let loader = new TwingLoaderFilesystem('.');

        let env = new TwingEnvironment(loader, {
            cache: false
        });

        let data = env.render(this.path, {
            name: this.parent.fqn,
            title: this.parent.fqn
        });

        return Promise.resolve(new State(this.name, data, null));
    }
}

exports.ComponentDemo = ComponentDemo;
