import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';
import type { Session } from '../App';
import { streamChat } from '../services/agentService';

interface AgentState {
  isOpen: boolean;
  messages: ChatMessage[];
  isProcessing: boolean;
  openAgent: () => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

let counter = 0;
const nextId = () => `msg-${Date.now()}-${++counter}`;

export function useAgent(session: Session): AgentState {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const openAgent = useCallback(() => setIsOpen(true), []);
  const closeAgent = useCallback(() => setIsOpen(false), []);
  const toggleAgent = useCallback(() => setIsOpen((prev) => !prev), []);
  const clearMessages = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isProcessing) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);

      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true },
      ]);

      try {
        // Build history for the API (user + previous assistant messages only)
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        for await (const event of streamChat(session, history)) {
          if (event.type === 'text') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + event.delta } : m,
              ),
            );
          }
          // tool_call and done events are handled silently
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Something went wrong. Please try again.' }
              : m,
          ),
        );
      } finally {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
        );
        setIsProcessing(false);
      }
    },
    [session, messages, isProcessing],
  );

  return { isOpen, messages, isProcessing, openAgent, closeAgent, toggleAgent, sendMessage, clearMessages };
}
