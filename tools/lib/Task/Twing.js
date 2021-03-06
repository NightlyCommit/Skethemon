const {Task} = require('../vendor/Task');
const {State} = require('../vendor/State');
const {TwingEnvironment, TwingLoaderArray, TwingLoaderChain} = require('twing/index');
const {inspect} = require('util');

/**
 * @typedef {Object} TaskTwingConfiguration
 * @property {string} file
 * @property {TwingLoaderInterface} loader
 * @property {TwingEnvironmentOptions | null} environment_options
 * @property {Map<string, TwingExtensionInterface> | null} extensions
 * @property {Promise<*>} context_provider
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
        this._config = Object.assign({}, {
            context_provider: Promise.resolve()
        }, config);
    }

    run(state, data) {
        return this._config.context_provider
            .then((context) => {
                let loader = new TwingLoaderChain([
                    new TwingLoaderArray(new Map([[
                        state.name, state.data
                    ]])),
                    this._config.loader
                ]);

                let env = new TwingEnvironment(loader, this._config.environment_options);

                for (let [name, extension] of this._config.extensions) {
                    env.addExtension(extension, name);
                }

                let render = env.render(state.name, data);

                return new State(this.name, render, Buffer.from(env.getSourceMap()));
            });
    }
}

exports.TaskTwing = TaskTwing;
