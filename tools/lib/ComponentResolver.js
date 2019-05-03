const {readdir} = require('fs');
const {join: joinPath, relative: relativePath, resolve: resolvePath, dirname: pathDirname} = require('path');
const {ComponentJavaScript} = require('./Component/JavaScript');
const {ComponentSass} = require('./Component/Sass');
const {ComponentTwig} = require('./Component/Twig');
const {ComponentCompound} = require('./vendor/Component/Compound');

class ComponentResolver {
    constructor(root) {
        this._root = root;
    }

    /**
     * @return Promise<ComponentCompound>
     */
    resolve() {
        let resolveAt = (root) => {
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

                            if (entry.isDirectory()) {
                                promises.push(resolveAt(joinPath(root, entry.name)));
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

                                return new ComponentCompound(root, components);
                            })
                        );
                    }
                )
            });
        };

        return resolveAt(this._root);
    }

    /**
     * @param {Dirent} entry
     * @param {string} name
     * @param {string} path
     * @return {ComponentFilesystem}
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
