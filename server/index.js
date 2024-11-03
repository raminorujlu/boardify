const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const amqp = require("amqplib");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

let channel, connection;

// Connect to RabbitMQ
async function connectQueue() {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
}
connectQueue();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);

    // Create queue for room if it doesn't exist
    try {
      await channel.assertQueue(roomId);
      console.log(`Queue created/confirmed for room: ${roomId}`);

      // Consume messages from queue
      channel.consume(roomId, (data) => {
        const message = JSON.parse(data.content);
        // Broadcast to all clients in room except sender
        socket.to(roomId).emit("draw", message);
        channel.ack(data);
      });
    } catch (error) {
      console.error("Error setting up queue:", error);
    }
  });

  socket.on("draw", async (data) => {
    try {
      // Publish drawing data to room queue
      await channel.sendToQueue(data.roomId, Buffer.from(JSON.stringify(data)));
    } catch (error) {
      console.error("Error publishing message:", error);
    }
  });

  socket.on("clear", ({ roomId }) => {
    socket.to(roomId).emit("clear");
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
