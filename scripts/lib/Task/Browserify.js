const {Task} = require('../Task');
const {State} = require('../State');
const {Readable} = require('stream');

const Browserify = require('browserify');

class TaskBrowserify extends Task {
    constructor(name, config) {
        super(name);

        this.config = config || {};
    }

    /**
     * @param {State} state
     * @returns {Promise<State[]>}
     */
    run(state) {
        let currentFile = null;
        let dependencies = [];

        let readable = new Readable({
            read() {
                this.push(state.data);
                this.push(null);
            }
        });

        let config = Object.assign({}, this.config, {
            entries: [readable]
        });

        return new Promise((resolve, reject) => {
            Browserify(config)
                .on('file', function (file, id, parent) {
                    dependencies.push(file);

                    currentFile = file;
                })
                .bundle((err, buffer) => {
                    if (err) {
                        console.warn(err);
                        // response.setError(currentFile, err.toString());
                    }

                    // console.warn(buffer);

                    let state = new State(this.name, buffer, null, dependencies);

                    resolve([
                        state
                    ]);
                })
            ;
        });
    }
}

exports.TaskBrowserify = TaskBrowserify;