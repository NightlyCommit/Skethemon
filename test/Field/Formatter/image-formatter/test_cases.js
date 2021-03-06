/**
 * @param {Function} require
 */
module.exports = (require) => {
    return [
        {
            title: 'With URL',
            content: {
                url: 'https://picsum.photos'
            }
        },
        {
            title: 'Landscape',
            content: {
                default_image_width: 800
            }
        },
        {
            title: 'Portrait',
            content: {
                default_image_height: 800
            }
        },
        {
            title: 'Square',
            content: {
                default_image_width: 1700,
                default_image_height: 80
            }
        }
    ];
};
