require('babel/register')({ experimental: true });
const Amazon = require('./amazon');

// const amazon = new Amazon('barney-photos', 'Honeymoon');
// const amazon = new Amazon('barney-photos',
//                           'Mils Galaxy Note',
//                           'C:\\Users\\B\\Pictures\\Mils Galaxy Note\\');
// const amazon = new Amazon('barney-photos',
//                           'BB Android Phone 2',
//                           'C:\\Users\\B\\Pictures\\BB Android Phone 2\\');

const amazon = new Amazon('barney-photos',
                          'test',
                          'C:\\Users\\B\\Pictures\\test\\');

amazon.checkThumbnails();

/*
Does 'completed' work?
New folder?
thumbnails
https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
*/