const {Component} = require('./lib/Component');
const {ComponentFilesystem} = require('./lib/Component/Filesystem');
const {Job} = require('./lib/Job');
const {Task} = require('./lib/Task');
const {State} = require('./lib/State');
const {TaskTwing} = require('./lib/Task/Twing');
const {outputFile} = require('fs-extra');
const BrowserSync = require('browser-sync');
const {join} = require('path');
const logger = require('eazy-logger').Logger();

let components = [
    new ComponentFilesystem('Field/field', 'test/Field/field/demo.html.twig')
];

let component = components[0];

let browserSync = BrowserSync.create(component.name);
let browserSyncConfig = {
    server: join('www', component.name),
    ui: false,
    open: false,
    notify: false,
    logLevel: 'silent'
};

let browserSyncInit = new Promise(function (resolve, reject) {
    browserSync.init(browserSyncConfig, function (err, bs) {
        let urls = bs.options.get("urls");


        let maxLength = 0;

        let name = component.name;
        let localURL = urls.get('local');
        let message = name + localURL;

        maxLength = Math.max(maxLength, message.length);

        maxLength += 2;

        logger.unprefixed('info', '{bold: Access URLs:}');
        logger.unprefixed('info', '{grey: %s}', '-'.repeat(maxLength));
        logger.unprefixed('info', ' %s: {bold:%s}', localURL, name);
        logger.unprefixed('info', '{grey: %s}', '-'.repeat(maxLength));

        resolve(bs);
    });
});

browserSyncInit.then((bs) => {
    component.initialState.then((state) => {
        let job = new Job('JOB 1', [
            new Job('JOB 2', [
                new Task('pre 1'),
                new Task('pre 2'),
                new Task('pre 3'),
                new Task('pre 4'),
                new Task('pre 5')
            ]),
            new TaskTwing('twig'),
            new Task('post 1'),
            new Task('post 2'),
            new Task('post 3'),
            new Task('post 4')
        ]);

        job.run(state).then((state) => {
            console.warn('COMPONENT STATE', state);

            outputFile('www/Field/field/index.html', state.data, (err) => {
                console.warn('Reloading', 'index.html');

                browserSync.reload('index.html');
            });
        });
    });
});


