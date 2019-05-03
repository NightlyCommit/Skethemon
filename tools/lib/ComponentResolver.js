const {readdir} = require('fs');
const {join: joinPath, relative: relativePath, resolve: resolvePath, dirname: pathDirname} = require('path');
const {ComponentJavaScript} = require('./Component/JavaScript');
const {ComponentSass} = require('./Component/Sass');
const {ComponentTwig} = require('./Component/Twig');
const {ComponentCompound} = require('./vendor/Component/Compound');

class ComponentResolver {
    /**
     * @param {string} root
     * @return Promise<ComponentCompound>
     */
    resolve(root) {
        let absoluteRoot = resolvePath(root);

        return new Promise((resolve) => {
            readdir(absoluteRoot, {withFileTypes: true},
                /**
                 * @param err
                 * @param {Dirent[]} entries
                 */
                (err, entries) => {
                    let promises = [];
                    let children = [];

                    for (let entry of entries) {
                        console.warn(entry);

                        if (entry.isDirectory()) {
                            promises.push(this.resolve(joinPath(root, entry.name)));
                        } else {
                            let componentPath = joinPath(root, entry.name);
                            let componentName = pathDirname(componentPath);
                            let component = this.createComponent(entry, componentName, componentPath);

                            if (component) {
                                children.push(component);
                            }
                        }
                    }

                    resolve(Promise.all(promises)
                        .then((components) => {
                            for (let child of children) {
                                components.unshift(child);
                            }

                            return new ComponentCompound(root.split('/').join('_'), components);
                        })
                    );
                }
            )
        });
    }

    /**
     * @param {Dirent} entry
     * @param {string} name
     * @param {string} path
     * @return {ComponentInterface}
     */
    createComponent(entry, name, path) {
        let component;

        switch (entry.name) {
            case 'index.js':
                component = new ComponentJavaScript(name, path);
                break;
            case 'index.scss':
                component = new ComponentSass(name, path);
                break;
            case 'index.html.twig':
                component = new ComponentTwig(name, path);
                break;
        }

        return component;
    }
}

exports.ComponentResolver = ComponentResolver;
