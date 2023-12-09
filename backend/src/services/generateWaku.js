import { createLightNode } from "@waku/sdk";
import { waitForRemotePeer } from "@waku/sdk";
import { waitForRemotePeer, Protocols } from "@waku/sdk";
import { createEncoder, createDecoder } from "@waku/sdk";
import protobuf from "protobufjs";

const { errorResponse } = require("../utils/response.js");

// Content topic
const contentTopic = "/light-guide/1/message/proto";

const encoder = createEncoder({ contentTopic });
const decoder = createDecoder(contentTopic);

async function generateWakuData(request, response, payload) {
  if (!payload) {
    return errorResponse(response, "Please provide a valid prompt");
  }

  try {
    // Start Light Node
    const node = await createLightNode({ defaultBootstrap: true });
    await node.start();

    // Wait for a successful peer connection
    await waitForRemotePeer(node);

    // Wait for peer connections with specific protocols
    await waitForRemotePeer(node, [Protocols.LightPush, Protocols.Filter]);

    // Message structure
    const ChatMessage = new protobuf.Type("ChatMessage")
      .add(new protobuf.Field("timestamp", 1, "uint64"))
      .add(new protobuf.Field("sender", 2, "string"))
      .add(new protobuf.Field("message", 3, "string"));

    const protoMessage = ChatMessage.create({
      timestamp: Date.now(),
      sender: "Alice",
      message: "Hello, World!",
    });

    // Serialise the message using Protobuf
    const serialisedMessage = ChatMessage.encode(protoMessage).finish();

    // Send the message using Light Push
    await node.lightPush.send(encoder, {
      payload: serialisedMessage,
    });

    const callback = (wakuMessage) => {
      // Check if there is a payload on the message
      if (!wakuMessage.payload) return;
      // Render the messageObj as desired in your application
      const messageObj = ChatMessage.decode(wakuMessage.payload);
      console.log(messageObj);
      return messageObj;
    };

    // Create a filter subscription
    const subscription = await node.filter.createSubscription();

    // Subscribe to content topics and process new messages
    await subscription.subscribe([decoder], callback);

    await subscription.unsubscribe([contentTopic]);

    return [callback, subscription];
  } catch (error) {
    console.log("Error", error);
    return errorResponse(response, error);
  } finally {
    // Stop the running light node
    await node.stop();
  }
}

module.exports = { generateWakuData };
