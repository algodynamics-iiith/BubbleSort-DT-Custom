// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.ALGORITHM_TABLE;
const userTable = process.env.USER_TABLE;
const numAlgorithms = 2;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = process.env.AWS_SAM_LOCAL
  ? new dynamodb.DocumentClient({
      endpoint: "http://host.docker.internal:8000",
    })
  : new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getAlgorithmHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;

  let user = await docClient
    .get({
      TableName: userTable,
      Key: {
        id: id,
      },
    })
    .promise();

  if (!user.Item) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 404,
      body: JSON.stringify({
        error: `User ${id} not found`,
      }),
    };
  }

  // user = user.Items[0];
  // return {
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //   },
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     user,
  //   }),
  // };

  // Check if id exists in the table
  const result = await docClient
    .get({
      TableName: tableName,
      Key: { id },
    })
    .promise();

  // If id exists return the item
  if (result.Item) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  }

  // Get all items from the table
  const items = await docClient
    .scan({
      TableName: tableName,
    })
    .promise();

  let algorithmIdCounts = Array(numAlgorithms).fill(0);
  // each item has a number algorithmId, count the number of times it appears
  items.Items.forEach((element) => {
    algorithmIdCounts[element.algorithmId]++;
  });

  console.log(algorithmIdCounts);

  // find the algorithm with the least appearances
  let leastAppearances = algorithmIdCounts[0];
  let leastAppearancesIndex = 0;
  for (let i = 1; i < algorithmIdCounts.length; i++) {
    if (algorithmIdCounts[i] < leastAppearances) {
      leastAppearances = algorithmIdCounts[i];
      leastAppearancesIndex = i;
    }
  }

  // Store the new item with id and algorithmId
  await docClient
    .put({
      TableName: tableName,
      Item: {
        id,
        algorithmId: leastAppearancesIndex,
        rollno: user.Item.rollno,
        timestamp: new Date().getTime(),
      },
    })
    .promise();

  // Return the new item
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      id,
      algorithmId: leastAppearancesIndex,
      algorithmIdCounts: algorithmIdCounts,
      rollno: user.Item.rollno,
      timestamp: new Date().getTime(),
    }),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
