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
            // let timeout = 0; //Math.ceil(Math.random() * 1000);
            //
            // setTimeout(() => {
            //     console.warn(this.name, timeout);
            //
            //     resolve(new State(this.name, state.data));
            // }, timeout);
            resolve([
                new State(this.name, state.data, null, [])
            ]);
        })
    }
}

exports.Task = Task;