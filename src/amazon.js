const fs = require('fs');
const _ = require('lodash');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Promise = require('bluebird');
const ProgressBar = require('progress');
const mime = require('mime');

const listLimit = 1000;
const thumbBucket = 'Thumbnails/';

Promise.promisifyAll(s3);

class Amazon {
	constructor(bucket, prefix, filePath) {
		this.bucket = bucket;
		this.prefix = prefix;
		this.filePath = filePath;

		this.files = [];
		this.bucketFiles = {};
		this.thumbnails = {};

		this.missingFiles = [];

	}

	async checkThumbnails() {
		// Load a list of filenames from the current directory.
		this.getFileList();
		// Load all objects + thumbnails in current bucket.
		this.bucketFiles = await this.loadAllObjects({});
		// Find what files need to be uploaded
		const missingFilesCount = this.findMissingFiles();
		console.log(`${missingFilesCount} missing files.`);

		if (missingFilesCount > 0) {
			await this.uploadMissingFiles();
			console.log('finished uploading missing');
			return;
		}

		this.thumbnails = await this.loadAllObjects({ prefix: thumbBucket + this.prefix });
		console.log(`Loaded ${this.bucketFiles.length} items and ${this.thumbnails.length} thumbnails.`);


		// Find what thumbnails need to be uploaded
		const missingThumbnails = this.findMissingThumbnails();
		console.log(`${missingThumbnails.length} missing thumbnails.`);
	}

	//=================
	// File methods

	getFileList(dir = '') {
		let fullPath = this.filePath + dir;
		let fullBucketPath = this.prefix + '/' + dir;
		let files = fs.readdirSync(fullPath);
		for (let i = 0; i < files.length; i++) {
			let stats = fs.statSync(fullPath + files[i]);
			if (stats.isFile()) {
				this.files.push({ path: fullPath, name: files[i], bucketAlias: fullBucketPath });
			}
			else if (stats.isDirectory()) {
				this.getFileList(`${dir}${files[i]}/`);
			}
		}
	}

	findMissingFiles() {
		this.missingFiles = [];
		for (let file of this.files) {
			if (!_.findWhere(this.bucketFiles, { Key: file.bucketAlias + file.name })) {
				this.missingFiles.push(file);
			}
		}
		return this.missingFiles.length;
	}

	async uploadMissingFiles() {
		let paramList = [];
		for (let file of this.missingFiles) {
			let filename = file.name;
			let filePath = file.path + filename;
			let bucket = this.bucket + file.bucketAlias;
				let fileBuffer = fs.readFileSync(filePath);
				paramList.push({Bucket: this.bucket, Key: file.bucketAlias + filename, ContentType: mime.lookup(filePath), Body: fileBuffer });
		}
		return new Promise((resolve) => {
			this.putObject(paramList, resolve);
		});
	}

	putObject(paramList, resolve) {
		let params = paramList[0];
		let uploadProgress = 0;
		let bar = new ProgressBar(':bar:percent', { total: 100, width: 20 });
		console.log(`Uploading ${params.Key}`);
		return s3.putObject(params)
				.on('httpUploadProgress', function (progress) {
					let percentage = parseInt(progress.loaded / progress.total * 100)
					if (percentage > uploadProgress) {
						uploadProgress = percentage;
						bar.tick();
					}
				})
				.send((err, data) => {
					if (err) {
						console.log('Error: ', err);
					} else {
						console.log(`Finished! ♪~ ᕕ(ᐛ)ᕗ`);
						console.log('');
						if (paramList.length > 1) {
							this.putObject(paramList.slice(1), resolve);
						}
						else {
							console.log('All file uploaded. ヾ(⌐■_■)ノ♪');
							resolve();
						}
					}
			  });
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
		_.forEach(this.bucketFiles, (item) => {
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