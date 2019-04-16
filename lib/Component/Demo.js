const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');

class ComponentDemo extends ComponentFilesystem {
    initialState() {
        let loader = new TwingLoaderFilesystem('.');

        let env = new TwingEnvironment(loader, {
            cache: false
        });

        let data = env.render(this.path, {
            name: 'Field/field',
            title: 'Field/field'
        });

        return Promise.resolve(new State(this.path, data, null));
    }
}

exports.ComponentDemo = ComponentDemo;
