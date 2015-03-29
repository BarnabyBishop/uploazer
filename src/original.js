const AWS = require('aws-sdk');
const gm = require('gm');

const s3 = new AWS.S3();
const resizeY = 800;

images = s3.load();
thumbnails = s3.loadThumbnails();

for (let key in images) {
	if (!thumbnails[key]) {
		thumb = gm.createThumbnail();
		s3.uploadThumbnail(thumb);
	}
}



s3.listObjects({ Bucket: 'barney-photos' }, (error, data) => {
	if (error) {
    	console.log(error); // error is Response.error
  	} else {
  		let contents = data.Contents;
    	console.log(`${contents.length} items.`);
    	console.log(contents[0]);
    	console.log(contents[contents.length - 1]);
		let marker = contents[contents.length - 1].Key;
    	s3.listObjects({ Bucket: 'barney-photos', Marker: marker }, (error, data) => {
    		let contents = data.Contents;
    		console.log(`${contents.length} items.`);
    		console.log(contents[0]);
    		console.log(contents[contents.length - 1]);

    	});

  	}
});

gm('/path/to/image.jpg')
.blur(30, 20)
.resize(resizeX, resizeY)
.autoOrient();
.write(response, function (err) {
  if (err) ...
});

/*
var params = { Bucket: 'barney-photos', Key: 'Honeymoon/20130605_143625.jpg' };
s3.getSignedUrl('getObject', params, function (err, url) {
  console.log('The URL is', url);
});
*/