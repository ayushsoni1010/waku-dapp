const { errorResponse, successResponse } = require("../utils/response.js");

async function handleWakuData(request, response) {
  try {
    const { payload } = request?.body;

    if (!payload) {
      return errorResponse(response, "Please provide the payload");
    }

    const data = await generateWakuData(request, response, payload);
    return successResponse(response, "Answers generated:", data);
  } catch (error) {
    console.error(`Error: ${error}`);
    return errorResponse(
      response,
      "We ran into an error while generating",
      error
    );
  }
}

module.exports = { handleWakuData };
