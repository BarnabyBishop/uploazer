const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Promise = require('bluebird');

Promise.promisifyAll(s3);

class Amazon {
  constructor(bucket, prefix) {
    this.bucket = bucket;
    this.prefix = prefix;
    this.content = [];
  }

  async loadAllObjects() {
    await this.listObjects();
    console.log('awaited: ', this.content.length);
    console.log(this.content[2]);
  }

  listObjects(marker) {
    console.log('listing');
    let params = { Bucket: this.bucket };
    if (marker) {
      params.Marker = marker;
    }
    if (this.prefix) {
      params.Prefix = this.prefix;
    }

    return s3.listObjectsAsync(params).then((data) => {
      this.content = this.content.concat(data.Contents);
      console.log('listed: ', this.content.length);
    });
  }
}



module.exports = Amazon