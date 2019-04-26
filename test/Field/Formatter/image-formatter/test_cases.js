/**
 * @param {Function} require
 */
module.exports = (require) => {
    return [
        {
            title: 'With URL',
            data: {
                url: 'https://picsum.photos'
            }
        },
        {
            title: 'Landscape',
            data: {
                default_image_width: 800
            }
        },
        {
            title: 'Portrait',
            data: {
                default_image_height: 800
            }
        }
    ];
};
