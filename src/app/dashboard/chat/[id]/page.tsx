"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Paperclip,
  Image,
  File,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  isRead: boolean;
}

interface OrderInfo {
  id: string;
  orderNumber: string;
  status: string;
  listing: {
    id: string;
    title: string;
    price: number;
    thumbnail?: string;
  };
  buyer: {
    id: string;
    name?: string;
    avatar?: string;
  };
  seller: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

// Mock order data
const mockOrder: OrderInfo = {
  id: "order-1",
  orderNumber: "ZEE-ABC123-XY",
  status: "IN_PROGRESS",
  listing: {
    id: "listing-1",
    title: "Professional Logo Design",
    price: 15000,
    thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop",
  },
  buyer: {
    id: "user-buyer",
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  seller: {
    id: "user-seller",
    name: "Creative Studio",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
  },
};

// Mock messages
const mockMessages: Message[] = [
  {
    id: "msg-1",
    orderId: "order-1",
    senderId: "user-buyer",
    receiverId: "user-seller",
    content: "Hi! I'm interested in your logo design service. Can you create a modern logo for my tech startup?",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isRead: true,
  },
  {
    id: "msg-2",
    orderId: "order-1",
    senderId: "user-seller",
    receiverId: "user-buyer",
    content: "Hello! Yes, I'd be happy to help. I specialize in modern and minimalist designs. Could you share more details about your startup and any specific preferences?",
    createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    isRead: true,
  },
  {
    id: "msg-3",
    orderId: "order-1",
    senderId: "user-buyer",
    receiverId: "user-seller",
    content: "We're a fintech company focused on mobile payments. I'd like something clean with blue accents. Maybe incorporate a subtle wave element?",
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    isRead: true,
  },
  {
    id: "msg-4",
    orderId: "order-1",
    senderId: "user-seller",
    receiverId: "user-buyer",
    content: "That sounds great! I'll prepare some initial concepts for you. You can expect 3 different variations within 48 hours. I'll also need your brand name and tagline if you have one.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: true,
  },
];

export default function ChatPage() {
  const params = useParams();
  const orderId = params?.id as string || "order-1";
  
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Current user ID (mock - would come from auth)
  const currentUserId = "user-buyer";
  const order = mockOrder;
  const otherUser = currentUserId === order.buyer.id ? order.seller : order.buyer;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      orderId,
      senderId: currentUserId,
      receiverId: otherUser.id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-cyan-100 text-cyan-800",
      DELIVERED: "bg-green-100 text-green-800",
      COMPLETED: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{otherUser.name}</h2>
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
            </div>
            <p className="text-sm text-muted-foreground">
              Order #{order.orderNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace("_", " ")}
          </Badge>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Order Context Card */}
          <div className="p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-3">
              <img
                src={order.listing.thumbnail}
                alt={order.listing.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{order.listing.title}</p>
                <p className="text-sm text-muted-foreground">
                  ₦{order.listing.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                <span>Escrow Protected</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUserId;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : ""}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isCurrentUser
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isCurrentUser ? "justify-end" : ""}`}>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                          {isCurrentUser && (
                            message.isRead ? (
                              <CheckCheck className="w-4 h-4 text-primary" />
                            ) : (
                              <Check className="w-4 h-4 text-muted-foreground" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2 rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                />
              </div>
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Order Details Sidebar - Desktop Only */}
        <div className="hidden lg:block w-80 border-l bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-xs">{order.orderNumber}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Escrow Status</h3>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Funds Secured</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Payment is held in escrow until you confirm delivery.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Request Revision
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Confirm Delivery
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Open Dispute
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
