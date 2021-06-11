const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
const bcrypt = require('bcryptjs');

exports.handler = async (event, context, callback) => {

    await getUser(event)
    .then(data => {
        if (data.Items.length === 0 || !bcrypt.compareSync(event.password, data.Items[0].password)) {
            callback(null, {
                statusCode: 401,
                body: "Email or password is incorrect.",
                headers: {
                    'Access-Control-Allow-Origin' : '*',
                },
            })
        } else {
            callback(null, {
                statusCode: 200,
                body: data.Items,
                headers: {
                    'Access-Control-Allow-Origin' : '*',
                    },
                })
        }
    }).catch((err) => {
        console.error(err);
    })

};

function getUser(login) {
    const params = {
        TableName: 'users',
        FilterExpression: "email = :a",
        ExpressionAttributeValues: {
            ":a": login.email
        }
    }
    return ddb.scan(params).promise();
}
