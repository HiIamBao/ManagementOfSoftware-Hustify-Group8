"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatDialogProps {
  currentUser: {
    name: string;
  };
}

export function ChatDialog({ currentUser }: ChatDialogProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: currentUser.name,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed bottom-0 right-8 z-50">
      <div className={cn(
        "bg-background border border-border transition-all duration-300",
        showChat ? "w-[320px] h-[400px] rounded-t-lg" : "w-[320px] h-12 rounded-t-lg"
      )}>
        {/* Chat Header - Always visible */}
        <div 
          className="flex items-center justify-between px-4 h-12 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowChat(!showChat)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#b10000]" />
            <h3 className="font-semibold text-sm">Chat with Community</h3>
          </div>
          {showChat ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Expandable Chat Content */}
        {showChat && (
          <div className="flex flex-col h-[calc(400px-3rem)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    message.sender === currentUser.name ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "rounded-lg p-2",
                    message.sender === currentUser.name
                      ? "bg-[#b10000] text-white"
                      : "bg-muted"
                  )}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-[40px] max-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 bg-[#b10000] hover:bg-[#b10000]/90"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 