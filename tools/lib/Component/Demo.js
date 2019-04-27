const {ComponentFilesystem} = require('./Filesystem');
const {State} = require('../State');
const {readFile} = require('fs');
const {join} = require('path');

class ComponentDemo extends ComponentFilesystem {
    /**
     * @param {Component} component
     */
    constructor(component) {
        super(`${component.name}`, 'tools/templates/demo.html.twig');

        /**
         * @type {Component}
         * @private
         */
        this._component = component;

        // this.component.parent = this;
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

    data() {

        return this.component.data()
            .then((data) => {
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
