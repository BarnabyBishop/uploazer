const babel = require("babel/register")({ experimental: true });
const Amazon = require('./amazon');

// const amazon = new Amazon('barney-photos', 'Honeymoon');
const amazon = new Amazon('barney-photos',
                          'Mils Galaxy Note',
                          'C:\\Users\\B\\Pictures\\Mils Galaxy Note\\');
amazon.checkThumbnails();

/*
Does 'completed' work?
New folder?
thumbnails
*/