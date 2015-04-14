const babel = require("babel/register")({ experimental: true });
const Amazon = require('./amazon');

// const amazon = new Amazon('barney-photos', 'Honeymoon');
const amazon = new Amazon('barney-photos',
                          'BB Android Phone 2',
                          'C:\\Users\\B\\Pictures\\BB Android Phone 2\\');
amazon.checkThumbnails();