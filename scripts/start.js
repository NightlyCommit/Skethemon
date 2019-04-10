const {Component} = require('./lib/Component');
const {ComponentFilesystem} = require('./lib/Component/Filesystem');
const {Job} = require('./lib/Job');
const {Task} = require('./lib/Task');
const {State} = require('./lib/State');
const {TaskTwing} = require('./lib/Task/Twing');

let MyTask = class extends Task {
    run(component) {
        return Promise.resolve(component);
    }
};

let components = [
    new ComponentFilesystem('demo', 'test/Field/field/demo.html.twig')
];

// components[0].source.then((data) => {
//     console.warn(data);
// });

let component = components[0];

component.initialState.then((state) => {
    let job = new Job('JOB 1', [
        new Job('JOB 2', [
            new Task(10),
            new Task(11),
            new Task(12),
            new Task(13),
            new Task(14)
        ]),
        new TaskTwing('twig'),
        new Task(1),
        new Task(2),
        new Task(3),
        new Task(4)
    ]);

    job.run(state).then((states) => {
        console.warn(states);
    });
});

