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
const codesTable = process.env.CODES_TABLE;
const userTable = process.env.USER_TABLE;

exports.postSubmitCodeHandler = async (event) => {
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
  const { id, source_code, language_id, inputs, outputs, test } = body;

  // If one of them is missing, return error
  if (!id || !source_code || !language_id || !inputs || !outputs) {
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

  const judge0_endpoint =
    "http://algodynamics.iiit.ac.in/judge0/submissions?X-Auth-Token=f6583e60-b13b-4228-b554-2eb332ca64e7&X-Auth-User=a1133bc6-a0f6-46bf-a2d8-6157418c6fe2&base64_encoded=true&wait=true";

  //  generate submissions array from inputs and outputs
  const submissions = inputs.map((input, index) => {
    return {
      source_code,
      language_id,
      stdin: input,
      expected_output: outputs[index] || null,
      cpu_time_limit: 5,
      cpu_extra_time: 5,
    };
  });

  // const judge0_body = { submissions };
  // const submissions_data = [];
  // use axios to make a post request to the judge0 endpoint
  // await submissions.forEach(async (submission) => {
  //   let judge0_response = await axios.post(judge0_endpoint, submission);
  //   console.log(judge0_response.data);
  //   tokens.push(judge0_response.data);
  // });
  // Create array of
  // for (let i = 0; i < submissions.length; i++) {
  //   let judge0_response = await axios.post(judge0_endpoint, submissions[i]);
  //   console.log(judge0_response.data);
  //   submissions_data.push(judge0_response.data);
  // }
  // Asyncronously make a post request to the judge0 endpoint, and wait for all at the end
  const submissions_data = await Promise.all(
    submissions.map(async (submission) => {
      let judge0_response = await axios.post(judge0_endpoint, submission);
      console.log(judge0_response.data);
      return judge0_response.data;
    })
  );

  // const judge0_json = judge0_response.data;

  // Get array of tokens from judge0 response
  // const tokens = judge0_json.map((submission) => {
  //   return submission.token;
  // });

  // const get_submission_endpoint =
  //   "http://algodynamics.iiit.ac.in/judge0/submissions/batch?" +
  //   "X-Auth-Token=f6583e60-b13b-4228-b554-2eb332ca64e7&" +
  //   "X-Auth-User=a1133bc6-a0f6-46bf-a2d8-6157418c6fe2&" +
  //   "base64_encoded=true&wait=true&" +
  //   "tokens=" +
  //   tokens.join(",");

  // const get_submission_response = await axios.get(get_submission_endpoint);
  // const get_submission_json = get_submission_response.data;
  // console.log(get_submission_json);

  // Send the response to the client

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      submissions: submissions_data,
      test: test || false,
      id: id,
    }),
  };

  // Store the submission in the database
  if (!test) {
    const submission = {
      id: nanoid(20),
      userId: id,
      timestamp: timestamp,
      source_code: source_code,
      language_id: language_id,
      submissions: submissions_data,
    };

    await docClient
      .put({
        TableName: codesTable,
        Item: submission,
      })
      .promise();
  }

  // All log statements are written to CloudWatch
  return response;
};
