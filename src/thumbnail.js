const gm = require('gm');
const exec = require('child_process').exec;

module.exports = {
    get: function(filePath, size, time, callback) {

    },

    getImageThumbnail: function(filePath, size, callback) {
        gm(filePath)
            .resize(null, size.height)
            .autoOrient()
            .toBuffer((err, buffer) => {
                if (err) {
                    throw err;
                }

                callback(buffer);
            });
    },

    getVideoThumbnail: function(filePath, size, time, callback) {
        exec('ffmpeg -ss ' + time + ' -vframes 1 -i ' + filePath + ' -y -s ' + size.height + ' -f image2 tmp/thumb1.jpg', () => {
            if (callback) {
                return callback();
            }
        });
    }
};