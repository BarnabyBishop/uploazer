const AWS = require('aws-sdk');
const s3 = new AWS.S3();

class Amazon {
  constructor(bucket) {
    this.bucket = bucket;
    this.content = [];
  }

  async loadAllObjects() {
    console.log('awaiting: ', this.content.length);
    await this.listObjects();
    console.log('awaited: ', this.content.length);
  }

  listObjects(marker) {
    console.log('listing');
    let params = { Bucket: 'bucket' };
    if (marker) {
      params.Marker = marker;
    }

    s3.listObjects(params, (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
      this.content = this.content.concat(data.Contents);
      console.log('listed: ', this.content.length);
    });
  }
}



module.exports = Amazon