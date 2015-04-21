const fs = require('fs');
const _ = require('lodash');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Promise = require('bluebird');
const ProgressBar = require('progress');
const mime = require('mime');
//const gm = require('gm');
const thumbnail = require('./thumbnail');


const listLimit = 1000;
const thumbBucket = 'Thumbnails/';
const thumbHeight = 600;
const thumbTime = '00:00:01';

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
		this.missingThumbnails = [];
	}

	async checkThumbnails() {
		try {
			// Load a list of filenames from the current directory.
			this.getFileList();
			// Load all objects + thumbnails in current bucket.
			console.log('Loading files from S3...');
			this.bucketFiles = await this.loadAllObjects({});
			console.log(`Loaded ${this.bucketFiles.length} items.`);

			// Find what files need to be uploaded
			this.missingFiles = this.findMissingFiles(this.bucketFiles);
			console.log(`${this.missingFiles.length} missing files.`);

			if (this.missingFiles.length > 0) {
				await this.uploadFiles(this.missingFiles, (file, params, fileList, resolve) => this.getFile(file, params, fileList, resolve));
			}

			return;

			this.thumbnails = await this.loadAllObjects({ prefix: thumbBucket + this.prefix });
			console.log(`Found ${this.thumbnails.length} thumbnails.`);


			// Find what thumbnails need to be uploaded
			this.missingThumbnails = this.findMissingFiles(this.thumbnails, thumbBucket);
			console.log(`${this.missingThumbnails.length} missing thumbnails.`);

			this.uploadFiles(this.missingThumbnails, (file, params, fileList, resolve) => this.getThumbnail(file, params, fileList, resolve));
		}
		catch (ex) {
			console.log(ex);
		}

	}

	//=================
	// File methods

	getFileList(dir = '') {
		let filePath = this.filePath + dir;
		let fullBucketPath = this.prefix + '/' + dir;
		let files = fs.readdirSync(filePath);
		for (let i = 0; i < files.length; i++) {
			let stats = fs.statSync(filePath + files[i]);
			if (stats.isFile()) {
				this.files.push({ fullPath: filePath + files[i], path: filePath, name: files[i], bucketAlias: fullBucketPath });
			}
			else if (stats.isDirectory()) {
				this.getFileList(`${dir}${files[i]}/`);
			}
		}
	}

	findMissingFiles(bucketFiles, prefix) {
		prefix = prefix || '';
		let missingFiles = [];
		for (let file of this.files) {
			if (!_.findWhere(bucketFiles, { Key: prefix + file.bucketAlias + file.name })) {
				let missingFile = _.clone(file);
				if (prefix) {
					missingFile.bucketAlias = prefix + file.bucketAlias;
				}
				missingFiles.push(missingFile);
			}
		}
		return missingFiles;
	}

	async uploadFiles(fileList, getBody) {
		return new Promise((resolve) => {
			this.uploadNextFile(fileList, getBody, resolve);
		});
	}

	getFile(file, params, fileList, resolve) {
		fs.readFile(file.fullPath, (err, buffer) => {
			if (err) {
				throw err;
			}
			params.Body = buffer;
			this.putObject(params, fileList, (_file, _params, _fileList, _resolve) => this.getFile(_file, _params, _fileList, _resolve), resolve);
		});

	}

	getThumbnail(file, params, fileList, resolve) {
		thumbnail.get(file.fullPath, thumbHeight, thumbTime, (buffer) => {
			if (buffer) {
				params.Body = buffer;
				this.putObject(params, fileList, (_file, _params, _fileList, _resolve) => this.getThumbnail(_file, _params, _fileList, _resolve), resolve);
			}
			else {
				// If the currentl file can't be thumbnailed skip to the next file
				this.uploadNextFile(fileList, (_file, _params, _fileList, _resolve) => this.getThumbnail(_file, _params, _fileList, _resolve), resolve);
			}
		});

		// gm(file.fullPath)
		// 	.resize(null, thumbHeight)
		// 	.autoOrient()
		// 	.toBuffer((err, buffer) => {
		// 		if (err) {
		// 			throw err;
		// 		}

		// 		params.Body = buffer;
		// 		this.putObject(params, fileList, (_file, _params, _fileList, _resolve) => this.getThumbnail(_file, _params, _fileList, _resolve), resolve);
		// 	});
	}

	uploadNextFile(fileList, getBody, resolve) {
		let file = fileList[0];
		let filename = file.name;
		let params = {Bucket: this.bucket, Key: file.bucketAlias + filename, ContentType: mime.lookup(file.fullPath) };
		getBody(file, params, fileList, resolve);
	}

	putObject(params, fileList, getBody, resolve) {
		let uploadProgress = 0;
		console.log(`Uploading ${params.Key}`);
		let bar = new ProgressBar('[:bar] :percent :etas ', { total: 100, width: 20, incomplete: ' ' });
		return s3.putObject(params)
				.on('httpUploadProgress', function (progress) {
					let percentage = parseInt(progress.loaded / progress.total * 100);
					if (percentage > uploadProgress) {
						uploadProgress = percentage;
						bar.tick();
					}
				})
				.send((err) => {
					if (err) {
						console.log('Error: ', err);
					} else {
						console.log(`Finished! ♪~ ᕕ(ᐛ)ᕗ`);
						console.log('');
						thumbnail.finishedWithThumbnail(fileList[0].fullPath);
						if (fileList.length > 1) {
							this.uploadNextFile(fileList.slice(1), getBody, resolve);
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

		if (objects.length === listLimit) {
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
		_.forEach(this.bucketFiles, (item) => {
			let thumbnail = _.find(this.thumbnails, (thumb) => {
					return thumb.Key.replace(thumbBucket, '') === item.Key;
				}
			);
			if (!thumbnail) {
				this.missingThumbnails.push(item.Key);
			}
		});
	}
}



module.exports = Amazon;
