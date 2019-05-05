const {Component} = require('../Component');
const {State} = require('../State');

/**
 * @class
 */
class ComponentCompound extends Component {
    /**
     * @param {string} name
     * @param {ComponentInterface[]} children
     */
    constructor(name, children) {
        super(name);

        /**
         * @type {ComponentInterface[]}
         * @private
         */
        this._children = children;
    }

    /**
     * @returns {ComponentInterface[]}
     */
    get children() {
        return this._children;
    }


    /**
     * @param name
     * @returns {ComponentInterface}
     */
    getChild(name) {
        return this.children.find((item) => {
            return item.name === name;
        });
    }

    /**
     * @param {ComponentInterface} component
     */
    addChild(component) {
        this._children.push(component);
    }

    /**
     * @param {string|null} name
     * @param {Function} addDependency
     * @returns {Promise<State>}
     */
    initialState(name = null, addDependency = null) {
        let states = [];

        let promises = this.children.map((component) => {
            return component.initialState(name, addDependency)
                .then((state) => {
                    if (state) {
                        states.push(state);
                    }
                });
        });

        return promises.reduce((accumulator, currentValue) => {
            return accumulator
                .then(() => {
                    return currentValue
                })
        }, Promise.resolve())
            .then(() => {
                let state;

                if (states.length) {
                    let statesData = states.map((state) => state.data);

                    state = new State(this.name, statesData.join('\n'), null);
                }

                return state;
            });
    }

    /**
     * @param {string} name
     * @param {Function} addDependency
     * @returns {Promise<Map<string, Map>>}
     */
    data(name = null, addDependency = null) {
        /**
         * @type {Map<string, Map>}
         */
        let data = new Map();

        let promises = this.children.map((component) => {
            return component.data(name, addDependency)
                .then((componentData) => {
                    if (componentData) {
                        data.set(component.name, componentData);
                    }
                });
        });

        return promises.reduce((accumulator, currentValue) => {
            return accumulator
                .then(() => {
                    return currentValue;
                })
        }, Promise.resolve())
            .then(() => {
                return data;
            });
    }

    /**
     * @returns {IterableIterator<ComponentInterface>}
     */
    [Symbol.iterator]() {
        return this.children.values();
    }
}

exports.ComponentCompound = ComponentCompound;
