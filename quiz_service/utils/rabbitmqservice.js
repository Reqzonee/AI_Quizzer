const amqplib = require('amqplib');

const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL;
console.log("🚀 ~ MESSAGE_BROKER_URL:", MESSAGE_BROKER_URL);
const EXCHANGE_NAME = process.env.EXCHANGE_NAME;
console.log("🚀 ~ EXCHANGE_NAME:", EXCHANGE_NAME);
const QUEUE_NAME = process.env.QUEUE_NAME;
console.log("🚀 ~ QUEUE_NAME:", QUEUE_NAME);

const CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true }); // Declare the exchange
    await channel.assertQueue(QUEUE_NAME, { durable: true }); // Declare the queue
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, "quiz-service"); // Bind the queue to the exchange
    return channel;
  } catch (err) {
    console.error("Failed to create channel:", err.message);
    throw err;
  }
};

const PublishMessage = async (channel, binding_key, msg) => {
  try {
    await channel.publish(EXCHANGE_NAME, "quiz-service", Buffer.from(msg));
    console.log("Message published: " + msg);
  } catch (error) {
    throw error;
  }
  console.log("Sent: ", msg);
};

const SubscribeMessage = async (channel, service, binding_key) => {
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key);
  channel.consume(appQueue.queue, (data) => {
    console.log("Received data");
    console.log(data.content.toString());
    channel.ack(data);
  });
};

module.exports = {
  CreateChannel,
  PublishMessage,
  SubscribeMessage
};
