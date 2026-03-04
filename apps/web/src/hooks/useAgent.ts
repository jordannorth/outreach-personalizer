import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { processAgentMessage } from '../services/agentService';

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

export function useAgent(): AgentState {
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

      try {
        const response = await processAgentMessage(content);
        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: 'assistant',
          timestamp: new Date(),
          ...response,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: 'Something went wrong. Please try again.',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  return { isOpen, messages, isProcessing, openAgent, closeAgent, toggleAgent, sendMessage, clearMessages };
}
