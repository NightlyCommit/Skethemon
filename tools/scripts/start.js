const {Job} = require('../lib/vendor/Job');
const {TaskTwing} = require('../lib/Task/Twing');
const {TaskSass} = require('../lib/Task/Sass');
const {TaskCssRebase} = require('../lib/Task/CssRebase');
const {TaskBrowserify} = require('../lib/Task/Browserify');
const {join: joinPath} = require('path');
const {TwingExtensionDebug, TwingLoaderRelativeFilesystem, TwingLoaderFilesystem, TwingLoaderChain} = require('twing/index');
const {TwingExtensionDrupal} = require('../lib/Twing/Extension/Drupal');
const {BuilderDevelopment: Builder} = require('../lib/Builder/Development');
const {DemoComponentResolver} = require('../lib/DemoComponentResolver');
const {inspect} = require('util');
const {parse: parseUrl} = require('url');
const {basename, extname, dirname, join} = require('path');
const {getSlug} = require('../lib/getSlug');

/**
 * @type {Map<string, string>}
 */
let outputDefinitions = new Map([
    ['twig', 'index.html'],
    ['sass', 'index.css'],
    ['js', 'index.js']
]);

let twigJob = new Job('twig', [
    new TaskTwing('render', {
        loader: new TwingLoaderChain([
            new TwingLoaderFilesystem(),
            new TwingLoaderRelativeFilesystem(),
        ]),
        extensions: new Map([
            ['debug', new TwingExtensionDebug()],
            ['drupal', new TwingExtensionDrupal()]
        ]),
        environment_options: {
            cache: joinPath('tmp', 'twig'),
            debug: true,
            auto_reload: true,
            source_map: true,
            autoescape: false
        },
    })
]);

let sassJob = new Job('sass', [
    new TaskSass('render', {
        precision: 8,
        outFile: outputDefinitions.get('sass'),
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true
    }),
    new TaskCssRebase('rebase', {
        /**
         * @param {{source: URL, url: URL, resolved: URL}} obj
         * @param done
         */
        rebase: (obj, done) => {
            done(parseUrl('assets/' + getSlug(join(dirname(obj.resolved.pathname), basename(obj.resolved.pathname, extname(obj.resolved.pathname)))) + extname(obj.resolved.pathname)));
        }
    })
]);

let javaScriptJob = new Job('js', [
    new TaskBrowserify('browserify')
]);

let job = new Job('demo', [
    twigJob,
    sassJob,
    javaScriptJob
]);

let builder = new Builder(job, outputDefinitions);

let componentResolver = new DemoComponentResolver('test');

componentResolver.resolve()
    .then((component) => {
        console.warn('component', inspect(component, false, 100));

        builder.buildComponent(component);
    });
