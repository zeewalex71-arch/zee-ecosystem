import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3003;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://z.ai"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active connections
const activeUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
const orderRooms = new Map<string, Set<string>>(); // orderId -> Set of userIds

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User authentication
  socket.on("authenticate", (data: { userId: string }) => {
    const { userId } = data;
    
    // Add socket to user's connections
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId)!.add(socket.id);
    
    // Join user's personal room for notifications
    socket.join(`user:${userId}`);
    
    console.log(`User ${userId} authenticated on socket ${socket.id}`);
    socket.emit("authenticated", { success: true });
  });

  // Join order chat room
  socket.on("join-order", (data: { orderId: string; userId: string }) => {
    const { orderId, userId } = data;
    
    // Join the order room
    socket.join(`order:${orderId}`);
    
    // Track room membership
    if (!orderRooms.has(orderId)) {
      orderRooms.set(orderId, new Set());
    }
    orderRooms.get(orderId)!.add(userId);
    
    console.log(`User ${userId} joined order ${orderId}`);
    
    // Notify others in the room
    socket.to(`order:${orderId}`).emit("user-joined", { userId });
  });

  // Leave order chat room
  socket.on("leave-order", (data: { orderId: string; userId: string }) => {
    const { orderId, userId } = data;
    
    socket.leave(`order:${orderId}`);
    
    if (orderRooms.has(orderId)) {
      orderRooms.get(orderId)!.delete(userId);
    }
    
    console.log(`User ${userId} left order ${orderId}`);
  });

  // Send message in order chat
  socket.on("send-message", (data: {
    orderId: string;
    senderId: string;
    receiverId: string;
    content: string;
    attachments?: string[];
  }) => {
    const { orderId, senderId, receiverId, content, attachments } = data;
    
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      orderId,
      senderId,
      receiverId,
      content,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    
    // Emit to order room
    io.to(`order:${orderId}`).emit("new-message", message);
    
    // Also emit to receiver's personal room for notifications
    io.to(`user:${receiverId}`).emit("message-notification", {
      ...message,
      orderId,
    });
    
    console.log(`Message sent in order ${orderId} from ${senderId} to ${receiverId}`);
  });

  // Mark messages as read
  socket.on("mark-read", (data: { orderId: string; userId: string }) => {
    const { orderId, userId } = data;
    
    // Notify the order room that messages were read
    socket.to(`order:${orderId}`).emit("messages-read", { orderId, userId });
  });

  // Typing indicator
  socket.on("typing", (data: { orderId: string; userId: string; isTyping: boolean }) => {
    const { orderId, userId, isTyping } = data;
    
    socket.to(`order:${orderId}`).emit("user-typing", { orderId, userId, isTyping });
  });

  // Support ticket chat
  socket.on("join-support", (data: { ticketId: string; userId: string; isAdmin: boolean }) => {
    const { ticketId, userId, isAdmin } = data;
    
    socket.join(`support:${ticketId}`);
    console.log(`User ${userId} (${isAdmin ? 'admin' : 'user'}) joined support ticket ${ticketId}`);
  });

  socket.on("send-support-message", (data: {
    ticketId: string;
    senderId: string;
    content: string;
    isFromAdmin: boolean;
  }) => {
    const { ticketId, senderId, content, isFromAdmin } = data;
    
    const message = {
      id: `support-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      ticketId,
      senderId,
      content,
      isFromAdmin,
      createdAt: new Date().toISOString(),
    };
    
    io.to(`support:${ticketId}`).emit("new-support-message", message);
  });

  // Order status updates
  socket.on("order-status-update", (data: {
    orderId: string;
    status: string;
    updatedBy: string;
  }) => {
    io.to(`order:${data.orderId}`).emit("order-updated", data);
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from active users
    activeUsers.forEach((sockets, userId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          activeUsers.delete(userId);
        }
      }
    });
  });
});

// Health check endpoint
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", connections: io.engine.clientsCount }));
  }
});

httpServer.listen(PORT, () => {
  console.log(`Chat WebSocket server running on port ${PORT}`);
});
