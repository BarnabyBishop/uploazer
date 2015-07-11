require('babel/register')({ experimental: true });
const Amazon = require('./amazon');

// const amazon = new Amazon('barney-photos', 'Honeymoon');
const amazon = new Amazon('barney-photos',
                          'Mils Galaxy Note',
                          'C:\\Users\\B\\Pictures\\Mils Galaxy Note\\');

// const amazon = new Amazon('barney-photos',
//                           'BB Android Phone 2',
//                           'C:\\Users\\B\\Pictures\\BB Android Phone 2\\');

// const amazon = new Amazon('barney-photos',
//                           'Archer Studio',
//                           'C:\\Users\\B\\Pictures\\Archer Studio\\');

// const amazon = new Amazon('barney-photos',
//                           'B iPhone',
//                           'C:\\Users\\B\\Pictures\\B iPhone\\');

// const amazon = new Amazon('barney-photos',
//                            'test',
//                            '/home/barnaby/Pictures/');

amazon.checkThumbnails();