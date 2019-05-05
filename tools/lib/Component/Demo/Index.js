const {ComponentDemo} = require('../Demo');

class ComponentDemoIndex extends ComponentDemo {
    constructor(component) {
        super(component.name, 'tools/demo/index.html.twig');

        /**
         * @type {ComponentInterface}
         * @private
         */
        this._component = component;
    }

    /**
     * @returns {ComponentInterface}
     */
    get component() {
        return this._component;
    }

    /**
     * @param {string} name
     * @param {Function} addDependency
     * @returns {Promise<*>}
     */
    data(name = null, addDependency = null) {
        return this.component.data(name, addDependency)
            .then((data) => {
                if (data) {
                    return {
                        title: this.name,
                        timestamp: new Date().getTime(),
                        language: 'en',
                        direction: 'ltr',
                        content: data
                    };
                }
                else {
                    return this.component.data(name, addDependency);
                }
            });
    }

    initialState(name = null) {
        return super.initialState(name)
            .then((state) => {
                if (state) {
                    return state;
                } else {
                    return this.component.initialState(name);
                }
            });
    }
}

exports.ComponentDemoIndex = ComponentDemoIndex;
