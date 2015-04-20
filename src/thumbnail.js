const fs = require('fs');
const exec = require('child_process').exec;
const gm = require('gm');
const mime = require('mime');

const imageTypes = [
    'image/jpg',
    'image/gif'
];

const videoTypes = [
    'video/mp4'
];

let thumbnail = module.exports = {
    get: function(filePath, size, time, callback) {
        const mimeType = mime.lookup(filePath);
        if (imageTypes.indexOf(mimeType) > -1) {
            thumbnail.getImageThumbnail(filePath, size, callback);
        }
        else if (videoTypes.indexOf(mimeType) > -1) {
            thumbnail.getVideoThumbnail(filePath, size, time, callback);
        }
        else {
            callback();
        }
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
            fs.readFile('tmp/thumb1.jpg', (err, buffer) => {
                if (err) {
                    throw err;
                }
                callback(buffer);
            });
        });
    }
};