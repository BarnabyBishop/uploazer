const _ = require('lodash');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Promise = require('bluebird');

const listLimit = 1000;
const thumbBucket = 'Thumbnails/';

Promise.promisifyAll(s3);

class Amazon {
	constructor(bucket, prefix) {
		this.bucket = bucket;
		this.prefix = prefix;
		this.content = {};
		this.thumbnails = {};
	}

	async checkThumbnails() {
		// Load all objects in current bucket.
		this.content = await this.loadAllObjects({});
		this.thumbnails = await this.loadAllObjects({ prefix: thumbBucket + this.prefix });
		console.log(`Loaded ${this.content.length} items and ${this.thumbnails.length} thumbnails.`);
		const missingThumbnails = this.findMissingThumbnails();
		console.log(`Found ${missingThumbnails.length} missing thumbnails.`);
	}

	//=================
	// S3 load methods

	async loadAllObjects({ marker: marker, prefix: prefix }) {
		let objects = await this.listObjects({ marker: marker, prefix: prefix });

		if (objects.length == listLimit) {
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
			return data.Contents;
		}).error((error) => {
			console.error(error);
		});
	}

	//===================
	// Thumbnail methods
	findMissingThumbnails() {
		let missingThumbnails = [];
		_.forEach(this.content, (item) => {
			let thumbnail = _.find(this.thumbnails, (thumbnail) => {
					return thumbnail.Key.replace(thumbBucket, '') === item.Key;
				}
			);
			if (!thumbnail) {
				missingThumbnails.push(item.Key);
			}
		});
		return missingThumbnails;
	}
}



module.exports = Amazon