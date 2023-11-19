import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { addChatMessage } from "./controllers/chatController.js";

connectDB(); //Connect to MongoDB

const app = express();

const httpServer = createServer(app);
global.io = new Server(httpServer);

// io.on("connection", (socket) => {
//   socket.on("client sends message", (msg) => {
//     socket.broadcast.emit("server sends message from client to admin", {
//       message: msg,
//     });
//   });
// });

// Create a global variable to store pending messages for admins
const pendingMessages = {};

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  // Join the admin to a special 'adminChannel'
  socket.on("admin online", () => {
    socket.join("adminChannel");

    // Emit pending messages for each user to admin
    Object.keys(pendingMessages).forEach((userId) => {
      pendingMessages[userId].forEach((message) => {
        socket.emit("new user message", message);
      });
      delete pendingMessages[userId]; // Clear after sending
    });
  });

  // socket.on("admin offline", (data) => {
  //   const adminId = data.adminId;
  //   socket.leave("adminChannel");
  //   // Optional: Handle admin offline event, e.g., logging, updating status
  // });

  socket.on("join room", (userId) => {
    socket.join(userId);
  });

  socket.on("client sends message", async (data) => {
    console.log(`Received message from user ${data.userId}: ${data.message}`);
    // Check if the admin is connected
    const adminSocket = io.sockets.adapter.rooms.get("adminChannel");

    if (adminSocket && adminSocket.size > 0) {
      // Admin is connected, send the message
      // io.to("adminChannel").emit("new user message", data);
      io.emit("new user message", data);
    } else {
      // Admin is not connected, store the message in pendingMessages
      if (!pendingMessages[data.userId]) {
        pendingMessages[data.userId] = [];
      }
      pendingMessages[data.userId].push(data);

      // // Emit the "new user message" event to the admin
      io.emit("new user message", data);

      // Here, you can also emit a custom event to notify the admin
      // that there are pending messages for them. For example:
      // io.to(data.userId).emit("admin_pending_messages", {
      //   hasPendingMessages: true,
      // });
    }
  });

  socket.on("admin reconnects", () => {
    // Iterate over all pending messages and send them to the admin
    Object.keys(pendingMessages).forEach((userId) => {
      pendingMessages[userId].forEach((message) => {
        socket.emit("new user message", message);
      });
      delete pendingMessages[userId]; // Clear after sending
    });
  });

  socket.on("admin sends message", async (data) => {
    const mockReq = { body: data };
    const mockRes = {
      status: () => ({ json: () => {} }),
    };

    try {
      await addChatMessage(mockReq, mockRes);
      io.to(data.userId).emit("admin sends message", data);
    } catch (error) {
      console.error("Error handling message: ", error);
      // Handle error appropriately
    }
  });

  // // Optional: Disconnect event handler
  // socket.on("disconnect", () => {
  //   console.log("WebSocket disconnected");
  //   // Handle disconnection
  // });
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie parser middleware
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/config/paypal", (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve(); // Set __dirname to current directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
