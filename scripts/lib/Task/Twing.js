const {Task} = require('../Task');
const {State} = require('../State');
const {TwingEnvironment, TwingLoaderRelativeFilesystem, TwingSource, TwingLoaderArray, TwingLoaderChain} = require('twing');

exports.TaskTwing = class TaskTwing extends Task {
    /**
     * @param {State} state
     */
    run(state) {
        let env = new TwingEnvironment(new TwingLoaderChain([
            new TwingLoaderRelativeFilesystem()
        ]), {});

        console.warn(state);

        let render = env.render(state.name);

        return Promise.resolve(new State(state.name, render))
    }
};