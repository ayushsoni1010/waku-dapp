const express = require("express");

const { handleWakuData } = require("../controllers/wakuController.js");
const { successResponse, errorResponse } = require("../utils/response.js");

const router = express.Router();

router.get("/", async (_request, response) => {
  return successResponse(response, "Welcome to Waku REST API, Get connected with Unity!");
});

router.post("/generate", async (request, response) => {
  try {
    const payload = request?.body?.payload;

    if (!payload) {
      return errorResponse(
        response,
        "Please enter the payload to generate data"
      );
    }

    return await handleWakuData(request, response);
  } catch (error) {
    console.error(`Error: ${error}`);
    errorResponse(response, "An error occurred while generating data.", error);
  }
});

module.exports = router;
