module.exports = (Runtime) => {
    let templates = {};
    

    /* @Src/Field/field/field.html.twig */
    templates.__TwingTemplate_80556be0d0407d19d92a4a251811fed5dab86e0a22e296c7101f0319da70cc96 = class __TwingTemplate_80556be0d0407d19d92a4a251811fed5dab86e0a22e296c7101f0319da70cc96 extends Runtime.TwingTemplate {
        constructor(env) {
            super(env);

            this.source = this.getSourceContext();

            this.parent = false;

            this.blocks = new Map([
            ]);
        }

        doDisplay(context, blocks = new Map()) {
            // line 40, column 3
            context.set(`title_classes`, [((Runtime.compare(            // line 41, column 5
(context.has(`label_display`) ? context.get(`label_display`) : null), `visually_hidden`)) ? (`visually-hidden`) : (``))]);
            // line 44, column 1
            Runtime.echo(`
`);
            // line 45, column 4
            if ((context.has(`label_hidden`) ? context.get(`label_hidden`) : null)) {
                // line 46, column 1
                Runtime.echo(`  `);
                if ((context.has(`multiple`) ? context.get(`multiple`) : null)) {
                    // line 47, column 1
                    Runtime.echo(`    <div`);
                    Runtime.echo(this.env.getFilter('escape').traceableCallable(47, this.source)(...[this.env, (context.has(`attributes`) ? context.get(`attributes`) : null), `html`, null, true]));
                    Runtime.echo(`>
      `);
                    // line 48, column 10
                    context.set('_parent', Runtime.clone(context));

                    (() => {
                        let c = Runtime.twingEnsureTraversable((context.has(`items`) ? context.get(`items`) : null));

                        if (c === context) {
                            context.set('_seq', Runtime.clone(context));
                        }
                        else {
                            context.set('_seq', c);
                        }
                    })();

                    Runtime.each.bind(this)(context.get('_seq'), (__key__, __value__) => {
                        context.set(`_key`, __key__);
                        context.set(`item`, __value__);
                        // line 49, column 1
                        Runtime.echo(`        <div`);
                        Runtime.echo(this.env.getFilter('escape').traceableCallable(49, this.source)(...[this.env, this.traceableMethod(Runtime.twingGetAttribute, 49, this.source)(this.env, context.get(`item`), `attributes`, []), `html`, null, true]));
                        Runtime.echo(`>`);
                        Runtime.echo(this.env.getFilter('escape').traceableCallable(49, this.source)(...[this.env, this.traceableMethod(Runtime.twingGetAttribute, 49, this.source)(this.env, context.get(`item`), `content`, []), `html`, null, true]));
                        Runtime.echo(`</div>
      `);
                    });
                    (() => {
                        let parent = context.get('_parent');
                        context.delete('_seq');
                        context.delete('_iterated');
                        context.delete('_key');
                        context.delete('item');
                        context.delete('_parent');
                        context.delete('loop');
                        for (let [k, v] of parent) {
                            if (!context.has(k)) {
                                context.set(k, v);
                            }
                        }
                    })();
                    // line 51, column 1
                    Runtime.echo(`    </div>
  `);
                }
                else {
                    // line 53, column 1
                    Runtime.echo(`    `);
                    context.set('_parent', Runtime.clone(context));

                    (() => {
                        let c = Runtime.twingEnsureTraversable((context.has(`items`) ? context.get(`items`) : null));

                        if (c === context) {
                            context.set('_seq', Runtime.clone(context));
                        }
                        else {
                            context.set('_seq', c);
                        }
                    })();

                    Runtime.each.bind(this)(context.get('_seq'), (__key__, __value__) => {
                        context.set(`_key`, __key__);
                        context.set(`item`, __value__);
                        // line 54, column 1
                        Runtime.echo(`      <div`);
                        Runtime.echo(this.env.getFilter('escape').traceableCallable(54, this.source)(...[this.env, (context.has(`attributes`) ? context.get(`attributes`) : null), `html`, null, true]));
                        Runtime.echo(`>`);
                        Runtime.echo(this.env.getFilter('escape').traceableCallable(54, this.source)(...[this.env, this.traceableMethod(Runtime.twingGetAttribute, 54, this.source)(this.env, context.get(`item`), `content`, []), `html`, null, true]));
                        Runtime.echo(`</div>
    `);
                    });
                    (() => {
                        let parent = context.get('_parent');
                        context.delete('_seq');
                        context.delete('_iterated');
                        context.delete('_key');
                        context.delete('item');
                        context.delete('_parent');
                        context.delete('loop');
                        for (let [k, v] of parent) {
                            if (!context.has(k)) {
                                context.set(k, v);
                            }
                        }
                    })();
                    // line 56, column 1
                    Runtime.echo(`  `);
                }
            }
            else {
                // line 58, column 1
                Runtime.echo(`  <div`);
                Runtime.echo(this.env.getFilter('escape').traceableCallable(58, this.source)(...[this.env, (context.has(`attributes`) ? context.get(`attributes`) : null), `html`, null, true]));
                Runtime.echo(`>
    <div`);
                // line 59, column 9
                Runtime.echo(this.env.getFilter('escape').traceableCallable(59, this.source)(...[this.env, this.traceableMethod(Runtime.twingGetAttribute, 59, this.source)(this.env, (context.has(`title_attributes`) ? context.get(`title_attributes`) : null), `addClass`, [(context.has(`title_classes`) ? context.get(`title_classes`) : null)], `method`), `html`, null, true]));
                Runtime.echo(`>`);
                Runtime.echo(this.env.getFilter('escape').traceableCallable(59, this.source)(...[this.env, (context.has(`label`) ? context.get(`label`) : null), `html`, null, true]));
                Runtime.echo(`</div>
    `);
                // line 60, column 8
                if ((context.has(`multiple`) ? context.get(`multiple`) : null)) {
                    // line 61, column 1
                    Runtime.echo(`      <div>
    `);
                }
                // line 63, column 1
                Runtime.echo(`    `);
                context.set('_parent', Runtime.clone(context));

                (() => {
                    let c = Runtime.twingEnsureTraversable((context.has(`items`) ? context.get(`items`) : null));

                    if (c === context) {
                        context.set('_seq', Runtime.clone(context));
                    }
                    else {
                        context.set('_seq', c);
                    }
                })();

                Runtime.each.bind(this)(context.get('_seq'), (__key__, __value__) => {
                    context.set(`_key`, __key__);
                    context.set(`item`, __value__);
                    // line 64, column 1
                    Runtime.echo(`      <div`);
                    Runtime.echo(this.env.getFilter('escape').traceableCallable(64, this.source)(...[this.env, this.traceableMethod(Runtime.twingGetAttribute, 64, this.source)(this.env, context.get(`item`), `attributes`, []), `html`, null, true]));
                    Runtime.echo(`>`);
                    Runtime.echo(this.env.getFilter('escape').traceableCallable(64, this.source)(...[this.env, this.traceableMethod(Runtime.twingGetAttribute, 64, this.source)(this.env, context.get(`item`), `content`, []), `html`, null, true]));
                    Runtime.echo(`</div>
    `);
                });
                (() => {
                    let parent = context.get('_parent');
                    context.delete('_seq');
                    context.delete('_iterated');
                    context.delete('_key');
                    context.delete('item');
                    context.delete('_parent');
                    context.delete('loop');
                    for (let [k, v] of parent) {
                        if (!context.has(k)) {
                            context.set(k, v);
                        }
                    }
                })();
                // line 66, column 1
                Runtime.echo(`    `);
                if ((context.has(`multiple`) ? context.get(`multiple`) : null)) {
                    // line 67, column 1
                    Runtime.echo(`      </div>
    `);
                }
                // line 69, column 1
                Runtime.echo(`  </div>
`);
            }
        }

        getTemplateName() {
            return `@Src/Field/field/field.html.twig`;
        }

        getSourceMapSource() {
            return this.env.getLoader().resolve(`@Src/Field/field/field.html.twig`);
        }

        isTraitable() {
            return false;
        }

        getDebugInfo() {
            return new Map([[98, {"line": 54, "column": 1}], [80, {"line": 53, "column": 1}], [75, {"line": 51, "column": 1}], [53, {"line": 49, "column": 1}], [36, {"line": 48, "column": 10}], [31, {"line": 47, "column": 1}], [28, {"line": 46, "column": 1}], [26, {"line": 45, "column": 4}], [23, {"line": 44, "column": 1}], [21, {"line": 41, "column": 5}], [20, {"line": 40, "column": 3}], [189, {"line": 69, "column": 1}], [185, {"line": 67, "column": 1}], [182, {"line": 66, "column": 1}], [160, {"line": 64, "column": 1}], [142, {"line": 63, "column": 1}], [138, {"line": 61, "column": 1}], [136, {"line": 60, "column": 8}], [130, {"line": 59, "column": 9}], [125, {"line": 58, "column": 1}], [120, {"line": 56, "column": 1}]]);
        }

        getSourceContext() {
            return new Runtime.TwingSource(`{#
/**
 * @file
 * Theme override for a field.
 *
 * To override output, copy the "field.html.twig" from the templates directory
 * to your theme's directory and customize it, just like customizing other
 * Drupal templates such as page.html.twig or node.html.twig.
 *
 * Instead of overriding the theming for all fields, you can also just override
 * theming for a subset of fields using
 * @link themeable Theme hook suggestions. @endlink For example,
 * here are some theme hook suggestions that can be used for a field_foo field
 * on an article node type:
 * - field--node--field-foo--article.html.twig
 * - field--node--field-foo.html.twig
 * - field--node--article.html.twig
 * - field--field-foo.html.twig
 * - field--text-with-summary.html.twig
 * - field.html.twig
 *
 * Available variables:
 * - attributes: HTML attributes for the containing element.
 * - label_hidden: Whether to show the field label or not.
 * - title_attributes: HTML attributes for the title.
 * - label: The label for the field.
 * - multiple: TRUE if a field can contain multiple items.
 * - items: List of all the field items. Each item contains:
 *   - attributes: List of HTML attributes for each item.
 *   - content: The field item's content.
 * - entity_type: The entity type to which the field belongs.
 * - field_name: The name of the field.
 * - field_type: The type of the field.
 * - label_display: The display settings for the label.
 *
 * @see template_preprocess_field()
 */
#}
{%
  set title_classes = [
    label_display == 'visually_hidden' ? 'visually-hidden',
  ]
%}

{% if label_hidden %}
  {% if multiple %}
    <div{{ attributes }}>
      {% for item in items %}
        <div{{ item.attributes }}>{{ item.content }}</div>
      {% endfor %}
    </div>
  {% else %}
    {% for item in items %}
      <div{{ attributes }}>{{ item.content }}</div>
    {% endfor %}
  {% endif %}
{% else %}
  <div{{ attributes }}>
    <div{{ title_attributes.addClass(title_classes) }}>{{ label }}</div>
    {% if multiple %}
      <div>
    {% endif %}
    {% for item in items %}
      <div{{ item.attributes }}>{{ item.content }}</div>
    {% endfor %}
    {% if multiple %}
      </div>
    {% endif %}
  </div>
{% endif %}
`, `@Src/Field/field/field.html.twig`, `/home/ericmorand/Projects/skethemon/src/Field/field/field.html.twig`);
        }
    };

    return templates;
};