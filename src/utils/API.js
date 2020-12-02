import axios from 'axios';
const AWS = require('aws-sdk');
//const fileStream = fs.createReadStream()

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AccessKeyId,
  secretAccessKey: process.env.REACT_APP_SecretAccessKey,
  region: process.env.REACT_APP_Region,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IdentityPoolId,
  })
})

// const s3 = new AWS.S3({
//   apiVersion: '2006-03-01'
// });

const docClient = new AWS.DynamoDB.DocumentClient();

export default {
  loadData: function() {
    return axios.get('https://s3-us-west-2.amazonaws.com/css490/input3.txt');
  },

  // s3Upload: function() {
  //   let bucketParams = {
  //     Bucket: 'css436prog4'
  //   }
  //   s3.listObjects(bucketParams, (err,data) => {
  //     err ? console.log('Error: ', err) : console.log(`Sucess ${JSON.stringify(data)}`);
  //     console.log(data.Contents);
  //     let contentKeys = Object.keys(data.Contents[0]);
  //     console.log(contentKeys, data.Contents[0][contentKeys[0]]);
  //   })
    
    // axios.get('https://s3-us-west-2.amazonaws.com/css490/input.txt').then( res => {
    //   let uploadParams = {
    //     Bucket: 'css436prog4',
    //     Key: '',
    //     Body: ''
    //   };
    //   const fs = require('fs');
    //   const path = require('path')
    //   console.log(res);
      // let fileStream = fs.createReadStream(res);
      // fileStream.on('error', err => {
      //   console.log('File error', err);
      // })

      // uploadParams.Body = fileStream;
      // uploadParams.Key = path.basename(res);

      // s3.upload(uploadParams, (err,data) => {
      //   if (err) throw err;
      //   console.log(data.Location);
      // })

    // })
    // s3.listBuckets((err,data) => {
    //   if(err) throw err;
    //   console.log(data.Buckets);
    // })
  // },
  clearData: function() {
    let params = {
      TableName: 'Program4'
    }

    docClient.scan(params, onScan);

    function onScan(err, data) {
      if (err) {
        console.error(`Unable to scan the table. Error JSON: ${JSON.stringify(err, null, 2)}`);

      } else {
        console.log('Scan succedded.');

        data.Items.map(item => {
          // console.log(item);
          const {lastName, firstName} = item;
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
        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
      }
    }
  },

  putData: function(data) {
    let params = {
      TableName: 'Program4',
      Item: data
    };
    // console.log(params, 'params payload')
    docClient.put(params, (err,data) => {
      err ? console.error('Unable to add') : console.log('Added item successfully');
    })
  },

  getData: async function(first, last) {
    
    first = first !== '' ? `${first[0].toUpperCase()}${first.substring(1)}` : '';
    last = last !== '' ?  `${last[0].toUpperCase()}${last.substring(1)}` : '';
    console.log(`first ${first} last ${last}`)
    
    if (first !== '' && last !== '') {
      let params = {
        TableName: 'Program4',
        Key: {
          'firstName': first,
          'lastName': last
        }
      }
          let sendData = await docClient.get(params
            // , (err, data) => {
            // if(err)
            //   throw err;
            
            // console.log('Item: ', JSON.stringify(data.Item, null, 2));
          // }
          ).promise();

          // console.log('my data', data);
          // console.log(JSON.stringify(data.Item))
          console.log(sendData.Item, 'full name last name combo');
      return sendData.Item !== undefined ? [sendData.Item] : [];

    } else if (last !== '') {
      let params = {
        TableName: 'Program4',
        FilterExpression: 'lastName = :l',
        ExpressionAttributeValues: {
          ':l': last
        }
      }
  
      let sendData = await docClient.scan(params
        // , onScan
        ).promise();
      console.log('scan method:', sendData.Items);
      return sendData.Items;

    } else if (first !== '') {
      let params = {
        TableName: 'Program4',
        FilterExpression: 'firstName = :f',
        ExpressionAttributeValues: {
          ':f': first
        }
      }

      let sendData = await docClient.scan(params
        // , onScan
        ).promise();

      return sendData.Items;
    }
  },
  getAllData: async function() {
    let params = {
      TableName: 'Program4',
    }

    let sendData = await docClient.scan(params
      // , onScan
    ).promise();
    // console.log('scan method:', sendData.Items);
    
    return sendData.Items;
  },
  // dlFile: async function() {
  //   let file = await s3.getObject({
  //     Bucket: 'css490',
  //     Key: 'input.txt'
  //   }, (err,data) => {
  //     if (err) throw err;
  //     // return data.Body
  //     console.log('file downloaded', data.Body)
  //   })

  //   let params ={
  //     Bucket: 'css436prog4',
  //     Key: 'input.txt',
  //     Body: file
  //   };
  //   console.log('params payload');
  //   let objectPromise = s3.putObject(params).promise();

  //   objectPromise.then(data =>{
  //     console.log(data);
  //   })

  // }
};