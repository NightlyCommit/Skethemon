const {Task} = require('../Task');
const {State} = require('../State');
const {Rebaser} = require('css-source-map-rebase');

class TaskCssRebase extends Task {
    constructor(name, config) {
        super(name);

        this._config = Object.assign({}, {
            rebase: (obj, done) => {
                done();
            }
        }, config);
    }

    /**
     * @param {State} state
     * @returns {Promise<State[]>}
     */
    run(state) {
        return new Promise((resolve, reject) => {
            let rebaser = new Rebaser({
                map: state.map.toString(),
                rebase: this._config.rebase
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
