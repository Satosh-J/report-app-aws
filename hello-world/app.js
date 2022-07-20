const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        await dynamo
          .delete({
            TableName: "TestReports",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}":
        body = await dynamo
          .get({
            TableName: "TestReports",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        break;
      case "GET /items":
        body = await dynamo.scan({ TableName: "TestReports" }).promise();
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body) ;
        const id = requestJSON.id || AWS.util.uuid.v4();
        await dynamo
          .put({
            TableName: "TestReports",
            Item: {
              id: id,
              name: requestJSON.name,
              alias: requestJSON.alias,
              species: requestJSON.species,
              company: requestJSON.company,
            }
          })
          .promise();
        body = `Put item ${id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
