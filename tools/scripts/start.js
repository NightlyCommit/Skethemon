const {ComponentDemoIndex} = require('../lib/Component/Demo/Index');
const {ComponentDemoTest} = require('../lib/Component/Demo/Test');
const {ComponentFilesystem} = require('../lib/vendor/Component/Filesystem');
const {ComponentCompound} = require('../lib/vendor/Component/Compound');
const {ComponentSass} = require('../lib/Component/Sass');
const {ComponentJavaScript} = require('../lib/Component/JavaScript');
const {Job} = require('../lib/vendor/Job');
const {TaskTwing} = require('../lib/Task/Twing');
const {TaskSass} = require('../lib/Task/Sass');
const {TaskCssRebase} = require('../lib/Task/CssRebase');
const {TaskBrowserify} = require('../lib/Task/Browserify');
const {outputFile, copy} = require('fs-extra');
const {join, dirname, resolve, relative} = require('path');
const {TwingExtensionDebug, TwingLoaderRelativeFilesystem, TwingLoaderFilesystem, TwingLoaderChain} = require('twing/index');
const {ContextResolver} = require('../lib/ContextResolver');
const {TwingExtensionDrupal} = require('../lib/Twing/Extension/Drupal');
const {BuilderDevelopment: Builder} = require('../lib/Builder/Development');
const {DemoComponentResolver} = require('../lib/DemoComponentResolver');
const {inspect} = require('util');

// let jobDefinitions = new Map([
//     ['twig', {
//         /**
//          * @param {ComponentFilesystem} component
//          * @returns {Job}
//          */
//         jobFactory: (component) => {
//             let filesystemLoader = new TwingLoaderFilesystem();
//
//             filesystemLoader.addPath('src', 'Src');
//             filesystemLoader.addPath('test', 'Test');
//
//             return new Job('Twig', [
//                 new TaskTwing('render', {
//                     file: component.name,
//                     loader: new TwingLoaderChain([
//                         filesystemLoader,
//                         new TwingLoaderRelativeFilesystem(),
//                     ]),
//                     extensions: new Map([
//                         ['debug', new TwingExtensionDebug()],
//                         ['drupal', new TwingExtensionDrupal()]
//                     ]),
//                     environment_options: {
//                         cache: join('tmp/twig', 'Field/field'),
//                         debug: true,
//                         auto_reload: true,
//                         source_map: true,
//                         autoescape: false
//                     },
//                     context_provider: ((file) => {
//                         let contextResolver = new ContextResolver(file);
//
//                         return Promise.all([
//                             contextResolver.getSources(),
//                             contextResolver.getContext()
//                         ]).then(([sources, context]) => {
//                             let componentResources = resources.has(component) ? resources.get(component) : [];
//
//                             for (let source of sources) {
//                                 let resource = new Resource(relative('.', source), ResourceType.WATCH);
//
//                                 componentResources.push(resource);
//                             }
//
//                             resources.set(component, componentResources);
//
//                             return {
//                                 test_cases: context
//                             };
//                         });
//                     })(resolve(join('test/Field/field', 'test_cases.js')))
//                 })
//             ])
//         },
//         output: 'index.html'
//     }],
//     ['sass', {
//         /**
//          * @param {ComponentFilesystem} component
//          * @returns {Job}
//          */
//         jobFactory: (component) => new Job('Stylesheet', [
//             new TaskSass('sass', {
//                 precision: 8,
//                 file: resolve(component.path),
//                 outFile: 'index.css',
//                 sourceMap: true,
//                 sourceMapEmbed: true
//             }),
//             new TaskCssRebase('rebase', {
//                 rebase: (obj, done) => {
//                     let resolved = obj.resolved;
//                     let componentResources = resources.has(component) ? resources.get(component) : [];
//
//                     componentResources.push(new Resource(resolved.path));
//
//                     resources.set(component, componentResources);
//
//                     done();
//                 }
//             })
//         ]),
//         output: 'index.css'
//     }],
//     ['js', {
//         /**
//          * @param {ComponentFilesystem} component
//          * @returns {Job}
//          */
//         jobFactory: (component) => new Job('JavaScript', [
//             new TaskBrowserify('browserify', {
//                 basedir: dirname(component.path)
//             })
//         ]),
//         output: 'index.js'
//     }],
// ]);

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
            cache: join('tmp', 'twig'),
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
        sourceMapEmbed: true
    }),
    // new TaskCssRebase('rebase', {
    //     rebase: (obj, done) => {
    //         // let resolved = obj.resolved;
    //         // let componentResources = resources.has(component) ? resources.get(component) : [];
    //         //
    //         // componentResources.push(new Resource(resolved.path));
    //         //
    //         // resources.set(component, componentResources);
    //
    //         done();
    //     }
    // })
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

let componentResolver = new DemoComponentResolver();

componentResolver.resolve('test/Field/Formatter/image-formatter')
    .then((component) => {
        // inject demo components
        let demoComponentName = join(component.name, 'Demo');

        component.addChild(
            new ComponentCompound(demoComponentName, [
                new ComponentSass(demoComponentName, 'tools/demo/index.scss')
            ])
        );

        component = new ComponentDemoIndex(component);

        console.warn('component', inspect(component, false, 100));

        builder.buildComponent(component);
    });
