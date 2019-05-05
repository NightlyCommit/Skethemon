const {Task} = require('../vendor/Task');
const {State} = require('../vendor/State');

const {render} = require('node-sass');

class TaskSass extends Task {
    constructor(name, config) {
        super(name);

        this.config = config || {};
    }

    /**
     * @param {State} state
     * @returns {Promise<State[]>}
     */
    run(state, data, addDependency) {
        let sassConfig = Object.assign({}, this.config, {
            data: state.data
        });

        return new Promise((resolve, reject) => {
            render(sassConfig, (err, sassRenderResult) => {
                if (err) {
                    reject(err);
                }
                else {
                    let css = sassRenderResult.css;
                    let map = sassRenderResult.map ;

                    resolve(new State(this.name, css, map));
                }
            })
        })
    }
}

exports.TaskSass = TaskSass;
