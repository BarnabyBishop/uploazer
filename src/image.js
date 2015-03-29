const gm = require('gm');
const resizeY = 800;

gm('/path/to/image.jpg')
.blur(30, 20)
.resize(resizeX, resizeY)
.autoOrient();
.write(response, function (err) {
  if (err) ...
});
