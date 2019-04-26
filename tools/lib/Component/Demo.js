const {ComponentFilesystem} = require('./Filesystem');

class ComponentDemo extends ComponentFilesystem {
    /**
     * @param {string} name
     * @param {Component} component
     */
    constructor(name, component) {
        super(name, 'tools/templates/demo.html.twig.twig');

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

    data() {
        return this.component.data()
            .then((data) => {
                return {
                    title: this.component.fqn,
                    timestamp: new Date().getTime(),
                    language: 'en',
                    direction: 'ltr',
                    test: data
                }
            });
    }
}

exports.ComponentDemo = ComponentDemo;
