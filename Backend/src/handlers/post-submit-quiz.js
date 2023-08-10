const axios = require("axios");

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = process.env.AWS_SAM_LOCAL
  ? new dynamodb.DocumentClient({
      endpoint: "http://host.docker.internal:8000",
    })
  : new dynamodb.DocumentClient();

const { nanoid } = require("nanoid");

// Get the DynamoDB table name from environment variables
const quizTable = process.env.QUIZ_TABLE;
const userTable = process.env.USER_TABLE;

exports.postSubmitQuizHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get the body from the event
  const body = JSON.parse(event.body);
  // Get id, timestamp, source_code, language_id, input and output from the body of the request
  const { id, responses, score } = body;

  // If one of them is missing, return error
  if (!id || !responses || score === undefined || score === null) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required fields",
      }),
    };
  }

  const timestamp = new Date().getTime();

  // TODO: Check if id is there in user table
  const user = await docClient
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

  // Store to quiz table
  const quiz = {
    id: id,
    responses: responses,
    score: score,
    timestamp: timestamp,
  };

  await docClient
    .put({
      TableName: quizTable,
      Item: quiz,
    })
    .promise();

  // Send the response to the client
  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: 200,
    body: JSON.stringify({
      message: "Successfully submitted quiz",
    }),
  };

  // All log statements are written to CloudWatch
  return response;
};
