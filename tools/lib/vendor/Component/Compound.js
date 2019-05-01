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
     * @param {string|null} name
     * @returns {Promise<State>}
     */
    initialState(name = null) {
        let states = [];

        let promises = this.children.map((component) => {
            return component.initialState(name)
                .then((state) => {
                    if (state) {
                        states.push(state);
                    }
                });
        });

        return promises.reduce((accumulator, next) => {
            return accumulator
                .then(() => {
                    return next
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

    data() {
        /**
         * @type {Map<string, Map>}
         */
        let data = new Map();

        let promises = this.children.map((component) => {
            return component.data()
                .then((componentData) => {
                    data.set(component.name, componentData);

                    return Promise.resolve();
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
