import type { Release } from '../types';

export interface SSEMessage {
  type: 'initial' | 'update' | 'delete' | 'error';
  releases?: Release[];
  release?: Release;
  releaseId?: string;
  error?: string;
}

export class SSEService {
  private eventSource: EventSource | null = null;
  private listeners: Set<(message: SSEMessage) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second, will exponentially increase

  /**
   * Subscribe to release updates via Server-Sent Events
   * @param token JWT authentication token
   * @param onMessage Callback for incoming messages
   */
  subscribe(token: string, onMessage: (message: SSEMessage) => void): () => void {
    this.listeners.add(onMessage);

    if (!this.eventSource) {
      this.connect(token);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(onMessage);
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  /**
   * Connect to the SSE endpoint
   */
  private connect(token: string): void {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    try {
      this.eventSource = new EventSource(`${apiUrl}/api/releases/subscribe`, {
        headers: {
          Authorization: `Bearer ${token}`,
        } as any,
      });

      this.eventSource.onmessage = (event: MessageEvent) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          this.notifyListeners(message);
          this.reconnectAttempts = 0; // Reset on successful message
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = () => {
        this.handleConnectionError(token);
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.handleConnectionError(token);
    }
  }

  /**
   * Handle connection errors with exponential backoff
   */
  private handleConnectionError(token: string): void {
    this.disconnect();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`SSE reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token);
      }, delay);
    } else {
      console.error('SSE connection failed after max reconnection attempts');
      this.notifyListeners({
        type: 'error',
        error: 'Failed to establish real-time connection. Falling back to polling.',
      });
    }
  }

  /**
   * Disconnect from SSE
   */
  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Notify all listeners of a message
   */
  private notifyListeners(message: SSEMessage): void {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in SSE listener:', error);
      }
    });
  }

  /**
   * Cleanup - disconnect and clear listeners
   */
  destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }
}

// Singleton instance
export const sseService = new SSEService();
