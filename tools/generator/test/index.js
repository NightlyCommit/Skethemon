const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const slash = require('slash');
const getSlug = require('speakingurl');

/**
 * @typedef {Object} TestGeneratorProps
 * @property {string} componentName
 * @property {string} testName
 * @property {string} testDescription
 * @property {string} testAuthor
 */

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options);

        let optionConfig = {
            type: String,
            required: true
        };

        this.option('componentName', optionConfig);
        this.option('testAuthor', optionConfig);
        this.option('testDescription', optionConfig);

        /**
         * @type {TestGeneratorProps}
         */
        this._props = {};
    }

    /**
     * @returns {TestGeneratorProps}
     */
    get props() {
        return this._props;
    }

    prompting() {
        if (!this.options.componentName) {
            // Have Yeoman greet the user.
            this.log(yosay(
                'Welcome to the ' + chalk.red('test') + ' generator!'
            ));

            let prompts = [
                {
                    type: 'input',
                    name: 'componentName',
                    message: 'Name of the component'
                },
                {
                    type: 'input',
                    name: 'testName',
                    message: 'Name of the test'
                },
                {
                    type: 'input',
                    name: 'testDescription',
                    message: 'Description of the test'
                },
                {
                    type: 'input',
                    name: 'testAuthor',
                    message: 'Author of the test',
                    store: true
                }
            ];

            return this.prompt(prompts).then((props) => {
                this._props = props;
            });
        } else {
            this._props = {
                componentName: this.options.componentName,
                testName: this.options.testName,
                testDescription: this.options.testDescription,
                testAuthor: this.options.testAuthor
            };
        }

    }

    writing() {
        let componentRoot = this.config.get('src').root;
        let testComponentRoot = this.config.get('test').root;
        let componentName = this.props.componentName.trim();

        let testName = this.props.testName ? this.props.testName : '';

        if (componentName) {
            testName = slash(path.join(componentName, testName));
        }

        // paths
        let testPath = slash(path.join(testComponentRoot, testName));

        let componentPath = null;
        let relativePathToComponent = null;

        if (componentName) {
            componentPath = slash(path.join(componentRoot, componentName));
            relativePathToComponent = slash(path.relative(testPath, componentPath));
        }

        let relativePathToTestComponentRoot = slash(path.relative(testPath, testComponentRoot));

        // data

        let data = {
            testName: testName,
            testDescription: this.props.testDescription,
            testAuthors: [this.props.testAuthor],
            testCleanName: getSlug(testName, '--'),
            relativePathToComponent: relativePathToComponent,
            relativePathToTestComponentRoot: relativePathToTestComponentRoot,
            componentName: componentName,
            componentCleanName: getSlug(componentName, '--')
        };

        let that = this;
        let extensions = ['html.twig', 'js', 'scss'];

        extensions.forEach(function (ext) {
            that.fs.copyTpl(
                that.templatePath('index.' + ext + '.ejs'),
                that.destinationPath(testPath, 'index.' + ext),
                data
            );
        });

        extensions.forEach(function (ext) {
            that.fs.copyTpl(
                that.templatePath('test.' + ext + '.ejs'),
                that.destinationPath(testPath, 'test.' + ext),
                data
            );
        });

        that.fs.copyTpl(
            that.templatePath('test.data.js.ejs'),
            that.destinationPath(testPath, 'test_cases.js'),
            data
        );
    }
};
