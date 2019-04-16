const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const slash = require('slash');
const getSlug = require('speakingurl');

/**
 * @typedef {Object} ComponentGeneratorProps
 * @property {string} componentName
 * @property {string} componentDescription
 * @property {string} componentAuthor
 */

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options);

        /**
         * @type {ComponentGeneratorProps}
         */
        this._props = {};
    }

    /**
     * @returns {ComponentGeneratorProps}
     */
    get props() {
        return this._props;
    }

    prompting() {
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the ' + chalk.red('component') + ' generator!'
        ));

        let prompts = [
            {
                type: 'input',
                name: 'componentName',
                message: 'Name of the component',
                validate: function (input) {
                    return input.length > 0;
                },
                store: true
            },
            {
                type: 'input',
                name: 'componentDescription',
                message: 'Description of the component',
                store: true
            },
            {
                type: 'input',
                name: 'componentAuthor',
                message: 'Author of the component',
                store: true
            }
        ];

        return this.prompt(prompts).then((props) => {
            this._props = props;
        });
    }

    writing() {
        let componentRoot = this.config.get('src').root;
        let componentCleanName = getSlug(this.props.componentName, '--');

        // paths
        let componentPath = slash(path.join(componentRoot, this.props.componentName));

        // data
        let data = {
            componentName: this.props.componentName,
            componentDescription: this.props.componentDescription,
            componentAuthors: [this.props.componentAuthor],
            componentCleanName: componentCleanName,
            componentPath: componentPath
        };

        let that = this;
        let extensions = ['html.twig', 'js', 'scss'];

        // src
        this.fs.copyTpl(
            that.templatePath('README.md.ejs'),
            that.destinationPath(componentPath, 'README.md'),
            data
        );

        extensions.forEach(function (ext) {
            that.fs.copyTpl(
                that.templatePath(`index.${ext}.ejs`),
                that.destinationPath(componentPath, `index.${ext}`),
                data
            );
        });

        this.fs.copyTpl(
            that.templatePath('component.html.twig.ejs'),
            that.destinationPath(componentPath, `${componentCleanName}.html.twig`),
            data
        );

        this.fs.copyTpl(
            that.templatePath('mixins.scss.ejs'),
            that.destinationPath(componentPath, 'mixins.scss'),
            data
        );

        this.fs.copyTpl(
            that.templatePath('variables.scss.ejs'),
            that.destinationPath(componentPath, 'variables.scss'),
            data
        );

        this.composeWith(path.resolve('tools/generator/test'), {
            componentName: this.props.componentName,
            testName: null,
            testDescription: this.props.componentDescription,
            testAuthor: this.props.componentAuthor
        });
    }
};
