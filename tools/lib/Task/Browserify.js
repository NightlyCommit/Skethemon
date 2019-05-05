const {Task} = require('../vendor/Task');
const {State} = require('../vendor/State');
const {Readable, Writable} = require('stream');
const {join} = require('path');
const {fromSource, removeComments} = require('convert-source-map');
const Browserify = require('browserify');

class TaskBrowserify extends Task {
    constructor(name, config) {
        super(name);

        this.config = config || {};
    }

    /**
     * @param {State} state
     * @param {*} data
     * @returns {Promise<State[]>}
     */
    run(state, data) {
        let currentFile = null;

        let readable = new Readable({
            read() {
                this.push(state.data);
                this.push(null);
            }
        });

        let config = Object.assign({}, this.config, {
            basedir: state.name,
            entries: [readable],
            debug: true
        });

        return new Promise((resolve, reject) => {
            Browserify(config)
                .on('file', function (file, id, parent) {
                    currentFile = file;
                })
                .bundle((err, buffer) => {
                    if (err) {
                        console.warn(err);
                        // response.setError(currentFile, err.toString());
                    }

                    let js = buffer.toString();

                    /**
                     * @type {Converter}
                     */
                    let map = fromSource(js);

                    if (map) {
                        let sources = [];

                        for (let source of map.getProperty('sources')) {
                            sources.push(join(state.name, source));
                        }

                        map.setProperty('sources', sources);

                        js = removeComments(js) + map.toComment();
                    }

                    resolve(new State(this.name, js, map ? Buffer.from(map.toJSON()) : null));
                })
            ;
        });
    }
}

exports.TaskBrowserify = TaskBrowserify;
