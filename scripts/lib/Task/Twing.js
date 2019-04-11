const {Task} = require('../Task');
const {State} = require('../State');
const {TwingEnvironment, TwingLoaderRelativeFilesystem, TwingLoaderFilesystem, TwingSource, TwingLoaderArray, TwingLoaderChain} = require('twing');

exports.TaskTwing = class TaskTwing extends Task {
    /**
     * @param {State} state
     */
    run(state) {
        let fsLoader = new TwingLoaderFilesystem();

        fsLoader.addPath('src', 'Src');
        fsLoader.addPath('test', 'Test');

        let env = new TwingEnvironment(new TwingLoaderChain([
            new TwingLoaderArray(new Map([
                [state.name, state.data]
            ])),
            new TwingLoaderRelativeFilesystem(),
            fsLoader
        ]), {});

        let render = env.render(state.name);

        return Promise.resolve(new State(state.name, render))
    }
};