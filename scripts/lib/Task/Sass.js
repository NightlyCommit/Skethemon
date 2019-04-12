const {Task} = require('../Task');
const {State} = require('../State');

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
    run(state) {
        let sassConfig = this.getConfig('index.css');

        sassConfig.outFile = 'index.css';
        sassConfig.sourceMap = true;
        sassConfig.data = state.data;
        sassConfig.includePaths = [
            'test/Field/field'
        ];

        return new Promise((resolve, reject) => {
            render(sassConfig, (err, sassRenderResult) => { // sass render success
                if (err) {
                    reject(err);
                }
                else {
                    let cssBuffer = sassRenderResult ? sassRenderResult.css : Buffer.from('');
                    let dependencies = sassRenderResult ? sassRenderResult.stats.includedFiles : [];

                    resolve([
                        new State('css', cssBuffer, null, dependencies)
                    ]);
                }
            })
        })
    }

    getConfig(file) {
        return Object.assign({}, this.config, {
            file: file,
            sourceMapEmbed: true
        });
    };
}

exports.TaskSass = TaskSass;