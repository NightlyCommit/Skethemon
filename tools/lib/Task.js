const {State} = require('./State');

class Task {
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
     * @return Promise<State[]>
     */
    run(state) {
        return new Promise((resolve) => {
            resolve([
                new State(this.name, state.data, null)
            ]);
        })
    }
}

exports.Task = Task;
