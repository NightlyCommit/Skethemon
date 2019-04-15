const {TwingExtension, TwingFunction} = require('twing');
const Attribute = require('drupal-attribute');

class TwingExtensionDrupal extends TwingExtension {
    getFunctions() {
        let index = 0;

        return new Map([
            [index++, new TwingFunction('drupal_attribute', (it) => {
                return new Attribute(it);
            })]
        ]);
    }
}

exports.TwingExtensionDrupal = TwingExtensionDrupal;
