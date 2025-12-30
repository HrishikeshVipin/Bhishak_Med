'use client';

import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderType: 'doctor' | 'patient';
  senderName: string;
  message: string;
  createdAt: string;
}

interface ChatBoxProps {
  socket: Socket;
  consultationId: string;
  userType: 'doctor' | 'patient';
  userName: string;
  initialMessages?: Message[];
  isWaitlisted?: boolean;
}

export default function ChatBox({
  socket,
  consultationId,
  userType,
  userName,
  initialMessages = [],
  isWaitlisted = false,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [, forceUpdate] = useState(0); // Force re-render trigger
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false); // Track if we've initialized

  const WAITLIST_MESSAGE_LIMIT = 10;

  // Initialize messages once on mount
  useEffect(() => {
    if (!hasInitialized.current && initialMessages.length > 0) {
      console.log('💬 ChatBox: Initial load with', initialMessages.length, 'messages');
      setMessages(initialMessages);
      hasInitialized.current = true;
    }
  }, [])

  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    // Only auto-scroll if user is already near the bottom, or if forced
    if (force || isNearBottom) {
      // Scroll only the chat container, not the entire page
      container.scrollTop = container.scrollHeight;
    }
  };

  // Socket listeners for real-time messages - setup once when socket is available
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ ChatBox: No socket available', { userType });
      return;
    }

    console.log('📡 ChatBox: Setting up socket listeners', {
      userType,
      consultationId,
      socketConnected: socket.connected,
      socketId: socket.id,
      socketRooms: (socket as any).rooms ? Array.from((socket as any).rooms) : 'N/A',
      timestamp: new Date().toISOString()
    });

    // Message handler - receives messages from OTHER users
    const handleReceiveMessage = (data: Message) => {
      console.log(`📨 ChatBox (${userType}): handleReceiveMessage CALLED`, {
        messageId: data.id,
        sender: data.senderName,
        text: data.message
      });

      // Add message to state
      setMessages((prev) => {
        const newMessages = [...prev, data];
        console.log('✅ ChatBox: Adding message', data.id, 'Total:', newMessages.length);
        return newMessages;
      });

      // Force re-render and scroll after state update
      setTimeout(() => {
        forceUpdate(n => n + 1);

        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          console.log('📜 Scrolled to bottom after receiving message');
        }
      }, 100);
    };

    // Message sent confirmation - replace temp ID with real ID
    const handleMessageSent = (data: Message) => {
      console.log('✅ ChatBox: Message confirmed by server', {
        messageId: data.id,
        timestamp: data.createdAt
      });

      setMessages((prev) => {
        // Find and replace the most recent temp message with the confirmed one
        const tempIndex = prev.findIndex(msg => msg.id.startsWith('temp-'));
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = data;
          console.log('🔄 ChatBox: Replaced temp ID with real ID:', data.id);
          return updated;
        }
        return prev;
      });
    };

    // Test if socket can receive ANY event - log everything during debugging
    socket.onAny((eventName, ...args) => {
      console.log(`🔔 ChatBox (${userType}): Socket received ANY event:`, eventName,
        eventName === 'receive-message' || eventName === 'message-sent' ? args : '(other event)');
    });

    // Attach listeners
    console.log(`📌 ChatBox (${userType}): Attaching receive-message listener...`);
    socket.on('receive-message', handleReceiveMessage);
    console.log(`📌 ChatBox (${userType}): Attaching message-sent listener...`);
    socket.on('message-sent', handleMessageSent);
    console.log('✅ ChatBox: Listeners attached', { userType, listenersCount: socket.listeners('receive-message').length });

    // Cleanup ONLY on unmount or when socket changes (not on every render)
    return () => {
      console.log('🧹 ChatBox: Removing listeners', {
        userType,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      socket.offAny(); // Remove the onAny listener
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-sent', handleMessageSent);
    };
  }, [socket]); // Only re-run when socket instance changes

  useEffect(() => {
    if (!socket) return;

    // Listen for typing indicators
    socket.on('user-typing', () => {
      setOtherUserTyping(true);
    });

    socket.on('user-stop-typing', () => {
      setOtherUserTyping(false);
    });

    // Listen for message limit reached
    socket.on('message-limit-reached', (data: { message: string; limit: number; currentCount: number }) => {
      setLimitReached(true);
      setLimitMessage(data.message);
      alert(data.message);
    });

    return () => {
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('message-limit-reached');
    };
  }, [socket]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { consultationId, userType, userName });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { consultationId });
    }, 1000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Check if limit is reached
    if (limitReached || (isWaitlisted && messages.length >= WAITLIST_MESSAGE_LIMIT)) {
      alert(`Message limit reached (${WAITLIST_MESSAGE_LIMIT} messages). Please wait for doctor to activate your account.`);
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`; // Temporary ID until server confirms

    // Optimistic UI update - add message immediately
    const optimisticMessage: Message = {
      id: tempId,
      senderType: userType,
      senderName: userName,
      message: messageText,
      createdAt: new Date().toISOString(),
    };

    console.log('📤 ChatBox: Adding message optimistically', {
      tempId,
      message: messageText.substring(0, 50)
    });

    setMessages((prev) => [...prev, optimisticMessage]);

    // Emit message to server
    console.log('📡 ChatBox: Emitting send-message event', {
      userType,
      consultationId,
      messageText: messageText.substring(0, 30),
      socketId: socket.id
    });

    socket.emit('send-message', {
      consultationId,
      senderType: userType,
      senderName: userName,
      message: messageText,
    });

    setNewMessage('');
    setIsTyping(false);
    socket.emit('stop-typing', { consultationId });

    // Force scroll to bottom when user sends a message
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
        console.log('📜 Scrolled to bottom after sending message', {
          scrollTop: container.scrollTop,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          messagesCount: messages.length + 1
        });
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Chat Consultation</h3>
        <p className="text-xs text-gray-500">Real-time messaging</p>
      </div>

      {/* Waitlist Warning Banner */}
      {isWaitlisted && (
        <div className="bg-orange-100 border-b border-orange-200 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-orange-600 text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">Limited Chat Access - Waitlisted Patient</p>
              <p className="text-xs text-orange-800 mt-1">
                You can send up to {WAITLIST_MESSAGE_LIMIT} messages total.
                <span className="font-semibold"> {messages.length}/{WAITLIST_MESSAGE_LIMIT} messages used.</span>
                {messages.length >= WAITLIST_MESSAGE_LIMIT ? ' Limit reached!' : ''}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Please wait for the doctor to activate your account for full access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '400px' }}
        key={`messages-${messages.length}`}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-2">💬</p>
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === userType ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderType === userType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.senderType !== userType && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</p>
                )}
                <p className="break-words">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderType === userType ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={
              isWaitlisted && messages.length >= WAITLIST_MESSAGE_LIMIT
                ? "Message limit reached"
                : "Type your message..."
            }
            disabled={isWaitlisted && messages.length >= WAITLIST_MESSAGE_LIMIT}
            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isWaitlisted && messages.length >= WAITLIST_MESSAGE_LIMIT
                ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                : ''
            }`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || (isWaitlisted && messages.length >= WAITLIST_MESSAGE_LIMIT)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {isWaitlisted && messages.length >= WAITLIST_MESSAGE_LIMIT && (
          <p className="text-xs text-orange-600 mt-2 font-medium">
            ⚠️ Message limit reached. Ask doctor to activate your account.
          </p>
        )}
      </form>
    </div>
  );
}
