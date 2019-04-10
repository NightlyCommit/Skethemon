const {Task} = require('./Task');

exports.Job = class Job extends Task {
    /**
     * @param {Task[]} tasks
     */
    constructor(name, tasks) {
        super();

        this._name = name;
        this._tasks = tasks;
    }

    /**
     * @returns {Task[]}
     */
    get tasks() {
        return this._tasks;
    }

    /**
     * @param {State} state
     * @returns {Promise<*>}
     */
    run(state) {
        let states = [];

        let runFunctions = this.tasks.map((task) => {
            return task.run.bind(task);
        });

        return runFunctions.reduce((accumulator, run) => {
            return accumulator.then((state) => {
                return run(state);
            });
        }, Promise.resolve(state)).then((states) => {
            return states;
        });
    }
};

