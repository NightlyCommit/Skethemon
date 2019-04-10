const {State} = require('./State');

exports.Task = class Task {
    constructor(name) {
        this._name = name;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @param {State} state
     * @return Promise<*>
     */
    run(state) {
        return new Promise((resolve) => {
            let timeout = Math.ceil(Math.random() * 1000);

            setTimeout(() => {
                console.warn(this.name, timeout);

                resolve(new State(this.name, state.data + ' ' + timeout));
            }, timeout);
        })
    }
};