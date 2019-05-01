const {ComponentDemo} = require('../Demo');

class ComponentDemoIndex extends ComponentDemo {
    /**
     * @param {ComponentInterface} component
     */
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

    data() {
        return this.component.data()
            .then((data) => {
                return {
                    title: this.name,
                    timestamp: new Date().getTime(),
                    language: 'en',
                    direction: 'ltr',
                    children: data
                };
            });
    }

    initialState(name = null) {
        if (name === 'twig') {
            return super.initialState(name);
        }
        else {
            return this.component.initialState(name);
        }
    }
}

exports.ComponentDemoIndex = ComponentDemoIndex;
