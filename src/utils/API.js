import axios from 'axios';
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AccessKeyId,
  secretAccessKey: process.env.REACT_APP_SecretAccessKey,
  region: process.env.REACT_APP_Region,
})

const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});

const docClient = new AWS.DynamoDB.DocumentClient();

export default {
  loadData: function () {
    return axios.get('https://s3-us-west-2.amazonaws.com/css490/input.txt');
  },

  clearData: async function () {
    let params = {
      TableName: 'Program4'
    }

    docClient.scan(params, onScan);

    const myBucket = {
      Bucket: 'css436prog4'
    }
    let myData = await s3.listObjects(myBucket).promise();
    let myKeys = myData.Contents[0] !== undefined ? myData.Contents.map(content => content.Key) : [];

    myKeys.map(key => s3.deleteObject({ Bucket: 'css436prog4', Key: key}, (err, data) => {
        if (err) throw err;
        console.log("Deleted from s3: ", data);
      })
    );
    function onScan(err, data) {
      if (err) {
        console.error(`Unable to scan the table. Error JSON: ${JSON.stringify(err, null, 2)}`);

      } else {
        console.log('Scan succedded.');

        data.Items.map(item => {
          const { lastName, firstName } = item;
          let params = {
            TableName: 'Program4',
            Key: {
              'lastName': lastName,
              'firstName': firstName
            }
          }

          docClient.delete(params, (err, data) => {
            if (err)
              throw err;

            console.log('Delete item succedded:', JSON.stringify(data, null, 2));
          })
        })
        if (typeof data.LastEvaluatedKey !== 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
      }
    }
  },

  putData: function (data) {
    let params = {
      TableName: 'Program4',
      Item: data
    };
    docClient.put(params, (err, data) => {
      err ? console.error('Unable to add') : console.log('Added item successfully', JSON.stringify(data, null, 2));
    })
  },

  getData: async function (first, last) {

    first = first !== '' ? `${first[0].toUpperCase()}${first.substring(1)}` : '';
    last = last !== '' ? `${last[0].toUpperCase()}${last.substring(1)}` : '';
    first = first.length === 2 ? first.toUpperCase() : first;

    if (first !== '' && last !== '') {

      let params = {
        TableName: 'Program4',
        Key: {
          'firstName': first,
          'lastName': last
        }
      }
      let sendData = await docClient.get(params).promise();
      return sendData.Item !== undefined ? [sendData.Item] : [];

    } else if (last !== '') {
      let params = {
        TableName: 'Program4',
        FilterExpression: 'lastName = :l',
        ExpressionAttributeValues: {
          ':l': last
        }
      }

      let sendData = await docClient.scan(params).promise();
      return sendData.Items;

    } else if (first !== '') {
      let params = {
        TableName: 'Program4',
        FilterExpression: 'firstName = :f',
        ExpressionAttributeValues: {
          ':f': first
        }
      }
      let sendData = await docClient.scan(params).promise();
      return sendData.Items;
    }
  },
  getAllData: async function () {
    let params = {
      TableName: 'Program4',
    }

    let sendData = await docClient.scan(params).promise();
    return sendData.Items;
  },

  checkFiles: async function (fileName) {
    const myBucket = {
      Bucket: 'css436prog4'
    }

    const inputBucket = {
      Bucket: 'css490'
    }

    let myContentSize = [];
    let inputContentSize = [];

    let myData = await s3.listObjects(myBucket).promise();
    let inputData = await s3.listObjects(inputBucket).promise();

    myContentSize = myData.Contents[0] !== undefined ? myData.Contents.map(content => content.Size) : [];
    inputContentSize = inputData.Contents[0] !== undefined ? inputData.Contents.map(content => content.Key === fileName ? content.Size : 0) : [];

    inputContentSize = inputContentSize.filter(size => size > 0);
    let boolSize = myContentSize.indexOf(inputContentSize[0]) === -1;

    if (boolSize) {
      console.log('file is being downloaded');
      let file = await s3.getObject({
        Bucket: 'css490',
        Key: fileName
      }, (err, data) => {
        if (err) throw err;
        return data.Body
      }).promise();

      let params = {
        Bucket: 'css436prog4',
        Key: `input${myContentSize.length}.txt`,
        Body: file.Body,
        ACL: 'public-read',
        ContentType: 'text/plain'
      };

      let objectPromise = s3.putObject(params).promise();
      objectPromise.then(data => {
        console.log(data);
      })
    }
  }
};