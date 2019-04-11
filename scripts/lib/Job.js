const {Task} = require('./Task');
const {State} = require('./State');

exports.Job = class Job extends Task {
    /**
     * @param {string} name
     * @param {Task[]} tasks
     */
    constructor(name, tasks) {
        super();

        this._name = name;
        this._tasks = tasks;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {Task[]}
     */
    get tasks() {
        return this._tasks;
    }

    /**
     * @param {State} state
     * @returns {Promise<State[]>}
     */
    run(state) {
        let results = [];

        let runFunctions = this.tasks.map((task) => {
            return task.run.bind(task);
        });

        return runFunctions.reduce((accumulatorPromise, nextPromise) => {
            return accumulatorPromise
                .then((state) => {
                    return nextPromise(state);
                })
                .then((states) => {
                    for (let state of states) {
                        results.push(state);
                    }

                    return states[states.length - 1];
                });
        }, Promise.resolve(state)).then(() => {
            return results;
        });
    }
};

