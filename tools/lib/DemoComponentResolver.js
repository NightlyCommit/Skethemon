const {ComponentResolver} = require('./ComponentResolver');
const {join: joinPath, dirname: pathDirname, resolve: resolvePath, sep: pathSeparator} = require('path');
const {ComponentDemoTest} = require('./Component/Demo/Test');

class DemoComponentResolver extends ComponentResolver {
    /**
     * @param {Dirent} entry
     * @param {string} name
     * @param {string} path
     * @return {ComponentInterface}
     */
    createComponent(entry, name, path) {
        let component;

        name = name.split(pathSeparator).join(' > ');

        if (entry.name === 'index.html.twig') {
            component = new ComponentDemoTest(name, path, resolvePath(joinPath(pathDirname(path), 'test_cases.js')));
        } else {
            component = super.createComponent(entry, name, path);
        }

        return component;
    }
}

exports
    .DemoComponentResolver = DemoComponentResolver;
