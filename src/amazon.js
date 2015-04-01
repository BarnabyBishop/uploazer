const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Promise = require('bluebird');
const listLimit = 1000;
Promise.promisifyAll(s3);


class Amazon {
  constructor(bucket, prefix) {
    this.bucket = bucket;
    this.prefix = prefix;
    this.content = [];
  }

  async checkThumbnails() {
    // Load all objects in current bucket.
    await this.loadAllObjects();
    await this.loadAllObjects(null, 'Thumbnails/' + this.prefix);
  }

  async loadAllObjects(marker, prefix) {
    let count = await this.listObjects(marker, prefix);

    if (count == listLimit) {
        let marker = this.content[this.content.length - 1].Key;
        await this.loadAllObjects(marker, prefix);
    }
  }

  listObjects(marker, prefix) {
    let params = { Bucket: this.bucket };
    if (marker) {
      params.Marker = marker;
    }
    params.Prefix = prefix ? prefix : this.prefix;

    return s3.listObjectsAsync(params).then((data) => {
      this.content = this.content.concat(data.Contents);
      return data.Contents.length;
    });
  }
}



module.exports = Amazon