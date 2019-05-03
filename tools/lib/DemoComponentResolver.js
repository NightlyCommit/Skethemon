const {ComponentResolver} = require('./ComponentResolver');
const {join: joinPath, dirname: pathDirname, resolve: resolvePath} = require('path');
const {ComponentDemoTest} = require('./Component/Demo/Test');
const {ComponentDemoIndex} = require('./Component/Demo/Index');
const {ComponentSass} = require('./Component/Sass');
const {ComponentJavaScript} = require('./Component/JavaScript');
const {ComponentCompound} = require('./vendor/Component/Compound');

class DemoComponentResolver extends ComponentResolver {
    /**
     * @param {Dirent} entry
     * @param {string} name
     * @param {string} path
     * @return {ComponentFilesystem}
     */
    createComponent(entry, name, path) {
        let component = super.createComponent(entry, name, path);

        if (entry.name === 'index.html.twig') {
            component = new ComponentDemoTest(component, joinPath(pathDirname(component.path), 'test_cases.js'));
        }

        return component;
    }

    /**
     * @returns {Promise<ComponentDemoIndex>}
     */
    resolve() {
        return super.resolve()
            .then((component) => {
                // inject demo components
                let demoComponentName = joinPath(component.name, 'Demo');

                component.addChild(
                    new ComponentCompound(demoComponentName, [
                        new ComponentSass(demoComponentName, 'tools/demo/index.scss'),
                        new ComponentJavaScript(demoComponentName, 'tools/demo/index.js')
                    ])
                );

                component = new ComponentDemoIndex(component);

                return component;
            });
    }
}

exports.DemoComponentResolver = DemoComponentResolver;
