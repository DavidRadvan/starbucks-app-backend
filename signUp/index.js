const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
const bcrypt = require('bcryptjs');

exports.handler = async (event, context, callback) => {

    const newUserId = context.awsRequestId;

    await getUser(event.email)
    .then(data => {
        if (data.Items.length === 0) {

            callback(null, {
                statusCode: 201,
                body: "",
                headers: {
                    'Access-Control-Allow-Origin' : '*',
                },
            });

            createUser(newUserId, event);

        } else {

            callback(null, {
                statusCode: 407,
                body: "Email in use",
                headers: {
                    'Access-Control-Allow-Origin' : '*',
                    },
                })

        }
    }).catch((err) => {
        console.error(err);
    })
};

function createUser(newUserId, newUser) {


    const params = {
        TableName: 'users',
        Item: {
            'user_id': newUserId,
            'email': newUser.email,
            'firstName': newUser.firstName,
            'lastName': newUser.lastName,
            'password': bcrypt.hashSync(newUser.password, 10)
        }
    }

    ddb.put(params).promise();
}

function getUser(email) {
    const params = {
        TableName: 'users',
        FilterExpression: "email = :a",
        ExpressionAttributeValues: {
            ":a": email
        }
    }
    return ddb.scan(params).promise();
}
