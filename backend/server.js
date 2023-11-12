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

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join room", (userId) => {
    socket.join(userId);
  });

  socket.on("client sends message", async (data) => {
    // Create mock request and response objects
    const mockReq = { body: data };
    const mockRes = {
      status: () => ({ json: () => {} }),
    };

    try {
      await addChatMessage(mockReq, mockRes);

      // Log the data being sent to the admin
      console.log("Broadcasting to admin:", data);
      // io.emit("server sends message from client to admin", data);
      io.emit("server sends message from client to admin", {
        userId: data.userId,
        ...data,
      });
      // socket.broadcast.emit("server sends message from client to admin", data);
      // socket.emit("user receives message", data);
    } catch (error) {
      console.error("Error handling message: ", error);
      // Handle error appropriately
    }
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
