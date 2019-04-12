module.exports = (Runtime) => {
    let templates = {};
    

    /* @Test/demo.html.twig */
    templates.__TwingTemplate_71e03729f5e2b69559f59e78821a822e933222d1d880fad13113f8d6576d9ca2 = class __TwingTemplate_71e03729f5e2b69559f59e78821a822e933222d1d880fad13113f8d6576d9ca2 extends Runtime.TwingTemplate {
        constructor(env) {
            super(env);

            this.source = this.getSourceContext();

            this.parent = false;

            this.blocks = new Map([
                ['body', [this, 'block_body']]
            ]);
        }

        doDisplay(context, blocks = new Map()) {
            // line 1, column 1
            Runtime.echo(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" type="text/css" href="index.css">
</head>
<body class="demo">
    `);
            // line 9, column 8
            this.traceableDisplayBlock(9, this.source)('body', context, blocks);
            // line 11, column 1
            Runtime.echo(`    <script type="text/javascript" src="index.js"></script>
</body>
</html>`);
        }

        // line 9, column 8
        block_body(context, blocks = new Map()) {
            // line 10, column 1
            Runtime.echo(`    `);
        }

        getTemplateName() {
            return `@Test/demo.html.twig`;
        }

        getSourceMapSource() {
            return this.env.getLoader().resolve(`@Test/demo.html.twig`);
        }

        getDebugInfo() {
            return new Map([[41, {"line": 10, "column": 1}], [39, {"line": 9, "column": 8}], [33, {"line": 11, "column": 1}], [31, {"line": 9, "column": 8}], [21, {"line": 1, "column": 1}]]);
        }

        getSourceContext() {
            return new Runtime.TwingSource(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" type="text/css" href="index.css">
</head>
<body class="demo">
    {% block body %}
    {% endblock %}
    <script type="text/javascript" src="index.js"></script>
</body>
</html>`, `@Test/demo.html.twig`, `/home/ericmorand/Projects/skethemon/test/demo.html.twig`);
        }
    };

    return templates;
};