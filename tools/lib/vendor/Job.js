const {Task} = require('./Task');
const {State} = require('./State');

/**
 * @implements IterableIterator
 */
class Job extends Task {
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
     * @param {*} data
     * @param {Function} addDependency
     * @returns {Promise<State>}
     */
    run(state, data, addDependency = null) {
        let runFunctions = this.tasks.map((task) => {
            return task.run.bind(task);
        });

        return runFunctions.reduce((accumulatorPromise, currentPromise) => {
            return accumulatorPromise
                .then((state) => {
                    return currentPromise(state, data, addDependency);
                })
        }, Promise.resolve(state))
            .then((state) => {
                return state;
            });
    }

    [Symbol.iterator]() {
        return this._tasks.values();
    }
}

exports.Job = Job;
