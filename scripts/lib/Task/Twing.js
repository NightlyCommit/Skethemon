const {Task} = require('../Task');
const {State} = require('../State');
const {TwingEnvironment, TwingLoaderArray, TwingLoaderChain} = require('twing');

/**
 * @typedef {Object} TaskTwingConfiguration
 * @property {TwingLoaderInterface} loader
 * @property {TwingEnvironmentOptions | null} options
 * @property {Map<string, TwingExtensionInterface> | null} extensions
 */

class CustomLoaderArray extends TwingLoaderArray {
    getCacheKey(name) {
        return name;
    }
}

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
            new CustomLoaderArray(new Map([[
                'entry', state.data
            ]]))
        ]);

        let env = new TwingEnvironment(loader, this._config.options);

        for (let [name, extension] of this._config.extensions) {
            env.addExtension(extension, name);
        }

        let render = env.render('entry');

        return Promise.resolve([
            new State(this.name, render)
        ])
    }
}

exports.TaskTwing = TaskTwing;