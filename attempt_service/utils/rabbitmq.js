const amqplib = require('amqplib');
const { createQuiz } = require('../rapozatory/AttemptQuizRepository');

const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL;
const EXCHANGE_NAME = process.env.EXCHANGE_NAME;
const QUEUE_NAME = process.env.QUEUE_NAME;

const consumeMessages = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();

    // Declare the exchange and queue, and bind them
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(queue.queue, EXCHANGE_NAME, "quiz-service"); // Ensure the routing key is correct

    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      QUEUE_NAME
    );

    channel.consume(queue.queue, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log(" [x] Received %s", message);

          // Call the desired function to process the message
          await createQuiz(message);

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error.message);
          // Optionally, you can handle message rejection or re-queueing here
          // channel.nack(msg, false, true); // Re-queue message
        }
      }
    });
  } catch (error) {
    console.error("Error in RabbitMQ consumer:", error.message);
  }
};

// Start the consumer
consumeMessages();

module.exports = { consumeMessages };
