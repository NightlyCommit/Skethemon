module.exports = (Runtime) => {
    let templates = {};
    

    /* entry */
    templates.__TwingTemplate_5420d1cdcb6f903c9b83d0508345140f1928cd6e4ca1b4d517e756d9002fac47 = class __TwingTemplate_5420d1cdcb6f903c9b83d0508345140f1928cd6e4ca1b4d517e756d9002fac47 extends Runtime.TwingTemplate {
        constructor(env) {
            super(env);

            this.source = this.getSourceContext();

            // line 1, column 12
            this.parent = this.loadTemplate(`@Test/demo.html.twig`, `entry`, 1);
            this.blocks = new Map([
                ['body', [this, 'block_body']]
            ]);
        }

        doGetParent(context) {
            return `@Test/demo.html.twig`;
        }

        doDisplay(context, blocks = new Map()) {
            this.parent.display(context, Runtime.merge(this.blocks, blocks));
        }

        // line 3, column 4
        block_body(context, blocks = new Map()) {
            // line 4, column 1
            Runtime.echo(`    <div class="demo--Field--field">
        <div class="test-case">
            <div class="test-case-title">
                *** This is a test case ***
            </div>
            <div class="test-case-content">
                ssss
                `);
            // line 11, column 20
            this.loadTemplate(`@Src/Field/field/field.html.twig`, `entry`, 11).display(context);
            // line 12, column 1
            Runtime.echo(`                `);
            // line 13, column 1
            Runtime.echo(`            </div>
        </div>
    </div>
`);
        }

        getTemplateName() {
            return `entry`;
        }

        getSourceMapSource() {
            return this.env.getLoader().resolve(`entry`);
        }

        isTraitable() {
            return false;
        }

        getDebugInfo() {
            return new Map([[43, {"line": 13, "column": 1}], [41, {"line": 12, "column": 1}], [39, {"line": 11, "column": 20}], [30, {"line": 4, "column": 1}], [28, {"line": 3, "column": 4}], [13, {"line": 1, "column": 12}]]);
        }

        getSourceContext() {
            return new Runtime.TwingSource(`{% extends "@Test/demo.html.twig" %}

{% block body %}
    <div class="demo--Field--field">
        <div class="test-case">
            <div class="test-case-title">
                *** This is a test case ***
            </div>
            <div class="test-case-content">
                ssss
                {% include "@Src/Field/field/field.html.twig" %}
                {#{% include "../../../src/Field/field.html.twig" %}#}
            </div>
        </div>
    </div>
{% endblock %}`, `entry`, ``);
        }
    };

    return templates;
};