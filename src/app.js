console.log('running!');

const es6 = () => 'es6ified!';

console.log(es6());

return;

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const params = {Bucket: 'Photos', Key: 'heloooo', Body: 'Hello!'};

s3.putObject(params, (err, data) => {
	if (err)
		console.log(err)
	else
		console.log("Successfully uploaded data to myBucket/myKey");

});