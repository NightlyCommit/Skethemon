const {Task} = require('../vendor/Task');
const {State} = require('../vendor/State');
const {Rebaser} = require('css-source-map-rebase');
const {URL: Url} = require('url');

class TaskCssRebase extends Task {
    constructor(name, config) {
        super(name);

        this._config = Object.assign({}, config);
    }

    /**
     * @param {State} state
     * @param {*} data
     * @param {Function} addDependency
     * @returns {Promise<State[]>}
     */
    run(state, data, addDependency = null) {
        return new Promise((resolve, reject) => {
            let rebaser = new Rebaser({
                map: state.map.toString(),
                rebase: (obj, done) => {
                    /**
                     * @param {Url} url
                     * @private
                     */
                    let _done = (url) => {
                        if (addDependency) {
                            addDependency(obj.resolved.pathname, url ? url.pathname : obj.resolved.pathname);
                        }

                        done(url);
                    };

                    this._config.rebase ? this._config.rebase(obj, _done) : _done(obj.resolved);
                }
            });

            let css = '';

            rebaser
                .on('data', (data) => {
                    css += data.toString();
                })
                .on('finish', () => {
                    resolve([
                        new State('rebase', css, state.map)
                    ]);
                });

            rebaser.write(state.data);
            rebaser.end();
        });
    }
}

exports.TaskCssRebase = TaskCssRebase;
