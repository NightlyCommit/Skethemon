const {Task} = require('../Task');
const {State} = require('../State');
const {TwingEnvironment, TwingLoaderArray, TwingLoaderChain} = require('twing');

/**
 * @typedef {Object} TaskTwingConfiguration
 * @property {string} file
 * @property {TwingLoaderInterface} loader
 * @property {TwingEnvironmentOptions | null} options
 * @property {Map<string, TwingExtensionInterface> | null} extensions
 * @property {*} context
 */
class TaskTwing extends Task {
    /**
     * @param {string} name
     * @param {TaskTwingConfiguration} config
     */
    constructor(name, config) {
        super(name);

        /**
         * @type {TaskTwingConfiguration}
         * @private
         */
        this._config = config;
    }

    /**
     * @param {State} state
     */
    run(state) {
        let loader = new TwingLoaderChain([
            this._config.loader,
            new TwingLoaderArray(new Map([[
                this._config.file, state.data
            ]]))
        ]);

        let env = new TwingEnvironment(loader, this._config.options);

        for (let [name, extension] of this._config.extensions) {
            env.addExtension(extension, name);
        }

        let render = env.render(this._config.file, this._config.context);

        return Promise.resolve([
            new State(this.name, render, Buffer.from(env.getSourceMap()))
        ])
    }
}

exports.TaskTwing = TaskTwing;
