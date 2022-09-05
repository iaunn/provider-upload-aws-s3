'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      ...config.config,
    });

    const upload = (file, customParams = {}) =>
      new Promise((resolve, reject) => {
        // upload file on S3 bucket
        let path = config.cdn.defaultPath ? `${config.cdn.defaultPath}/` : '';
        path = file.path ? `${path}${file.path}/` : path;
        S3.upload(
          {
            Key: `${path}${file.hash}${file.ext}`,
            Body: file.stream || Buffer.from(file.buffer, 'binary'),
            ACL: 'public-read',
            ContentType: file.mime,
            ...customParams,
            ...config.params
          },
          (err, data) => {
            if (err) {
              return reject(err);
            }

            // set the bucket file url
            if (config.cdn.baseUrl) {
              file.url = `${config.cdn.baseUrl}/${data.key}`
            } else {
              file.url = data.Location;
            }

            resolve();
          }
        );
      });

    return {
      uploadStream(file, customParams = {}) {
        return upload(file, customParams);
      },
      upload(file, customParams = {}) {
        return upload(file, customParams);
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          let path = config.cdn.defaultPath ? `${config.cdn.defaultPath}/` : '';
          path = file.path ? `${path}${file.path}/` : path;

          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
              ...customParams,
              ...config.params
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
