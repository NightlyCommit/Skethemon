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
     * @returns {Promise<State>}
     */
    run(state, data) {
        let runFunctions = this.tasks.map((task) => {
            return task.run.bind(task);
        });

        return runFunctions.reduce((accumulatorPromise, nextPromise) => {
            return accumulatorPromise
                .then((state) => {
                    return nextPromise(state, data);
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
