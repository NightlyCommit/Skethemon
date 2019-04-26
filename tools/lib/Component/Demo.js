const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {readFile} = require('fs');
const {join} = require('path');

class ComponentDemo extends ComponentFilesystem {
    /**
     * @param {Component} component
     */
    constructor(component) {
        super(`${component.name} demo`, 'tools/templates');

        /**
         * @type {Component}
         * @private
         */
        this._component = component;
    }

    /**
     * @returns {Component}
     */
    get component() {
        return this._component;
    }

    get fqn() {
        return this.component.fqn;
    }

    initialState(name = null) {
        let file = '';

        switch (name) {
            case 'twig': {
                file = 'demo.html.twig';
                break;
            }
            case 'sass': {
                file = 'demo.scss';
                break;
            }
        }

        console.warn(name, file);

        return new Promise((resolve, reject) => {
            readFile(join(this.path, file), 'UTF-8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new State(this.name, data, null));
                }
            });
        });
    }

    data() {
        return this.component.data()
            .then((data) => {
                console.warn(data);

                return {
                    title: this.fqn,
                    timestamp: new Date().getTime(),
                    language: 'en',
                    direction: 'ltr',
                    test: data
                }
            });
    }
}

exports.ComponentDemo = ComponentDemo;
