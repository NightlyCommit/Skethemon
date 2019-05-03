const {createSlug} = require('speakingurl');

exports.getSlug = createSlug({
    separator: '__',
    custom: {
        '-': '_'
    }
});
