import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Send, X, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content: "Olá! Sou o assistente IA do HospedaIA. Posso ajudá-lo com:\n\n• Check-in/out de hóspedes\n• Status dos quartos\n• Pedidos do restaurante\n• Relatórios financeiros\n\nComo posso ajudar?",
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Entendi sua solicitação. Estou processando... Para funcionalidade completa com IA, configure o backend do sistema. Posso ajudar com mais alguma coisa?",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full gradient-gold shadow-gold animate-pulse-glow z-50"
        size="icon"
      >
        <Bot className="w-6 h-6 text-primary" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 z-50 max-w-[calc(100vw-2rem)]",
        isMinimized ? "sm:w-80 h-16" : "sm:w-96 h-[70dvh] max-h-[500px]"
      )}
    >
      {/* Header */}
      <div className="gradient-primary p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground text-sm">Assistente IA</h4>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-primary-foreground/70">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 h-[calc(100%-9rem)] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-secondary" />
                      <span className="text-xs text-muted-foreground">IA</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={handleSend} size="icon" variant="hero">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
