const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Promise = require('bluebird');
const listLimit = 1000;
Promise.promisifyAll(s3);


class Amazon {
  constructor(bucket, prefix) {
    this.bucket = bucket;
    this.prefix = prefix;
    this.content = null;
    this.thumbnails = null;
  }

  async checkThumbnails() {
    // Load all objects in current bucket.
    this.content = await this.loadAllObjects();
    this.thumbnails = await this.loadAllObjects({ prefix: 'Thumbnails/' + this.prefix });
  }

  async loadAllObjects({ marker: marker, prefix: prefix }) {
    let objects = [];
    objects = objects.concat(await this.listObjects({ marker: marker, prefix: prefix }));

    if (count == listLimit) {
        let marker = objects[objects.length - 1].Key;
        objects = objects.concat(await this.loadAllObjects({ marker: marker, prefix: prefix }));
    }
    return objects;
  }

  listObjects({ marker: marker, prefix: prefix }) {
    let params = { Bucket: this.bucket };
    if (marker) {
      params.Marker = marker;
    }
    params.Prefix = prefix ? prefix : this.prefix;

    return s3.listObjectsAsync(params).then((data) => {
      this.content = this.content.concat(data.Contents);
      return data.Contents;
    });
  }
}



module.exports = Amazon