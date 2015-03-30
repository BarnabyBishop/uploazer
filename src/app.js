const babel = require("babel/register")({ experimental: true });
const Amazon = require('./amazon');

const amazon = new Amazon('barney-photos', 'BB Android Phone 2');
amazon.loadAllObjects();

console.log('app: ', amazon.content.length);
/*
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
*/