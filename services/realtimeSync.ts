export interface SyncMessage {
  type: 'update' | 'create' | 'delete' | 'conflict' | 'sync_status';
  entityType: string;
  entityId?: string;
  data?: any;
  timestamp: number;
  clientId: string;
  version?: number;
}

export interface ConflictInfo {
  entityId: string;
  entityType: string;
  localVersion: number;
  remoteVersion: number;
  localData: any;
  remoteData: any;
}

export type SyncStatusType = 'connected' | 'disconnected' | 'syncing' | 'sync_error';

export class RealtimeSyncService {
  private ws: WebSocket | null = null;
  private clientId: string;
  private url: string;
  private messageHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private syncStatusCallbacks: Array<(status: SyncStatusType) => void> = [];
  private pendingOperations: Map<string, any> = new Map();
  private conflictListeners: Array<(conflict: ConflictInfo) => void> = [];

  constructor(url: string = 'ws://localhost:3001') {
    this.clientId = 'client-' + Math.random().toString(36).substr(2, 9);
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected:', this.clientId);
          this.reconnectAttempts = 0;
          this.notifySyncStatus('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.notifySyncStatus('sync_error');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.notifySyncStatus('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect().catch(console.error), delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifySyncStatus('sync_error');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Send optimistic update to other clients
  broadcastUpdate(
    type: 'update' | 'create' | 'delete',
    entityType: string,
    entityId: string,
    data: any,
    version: number
  ) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, queuing operation');
      this.pendingOperations.set(entityId, { type, entityType, data, version });
      return;
    }

    const message: SyncMessage = {
      type,
      entityType,
      entityId,
      data,
      timestamp: Date.now(),
      clientId: this.clientId,
      version,
    };

    this.ws.send(JSON.stringify(message));
    this.notifySyncStatus('syncing');
  }

  private handleMessage(message: SyncMessage) {
    console.log('📨 Sync message received:', message);

    if (message.clientId === this.clientId) {
      // Ignore own messages
      return;
    }

    switch (message.type) {
      case 'conflict':
        this.handleConflict(message.data);
        break;
      case 'sync_status':
        this.notifySyncStatus(message.data);
        break;
      default:
        this.triggerHandlers(`${message.entityType}:${message.type}`, message);
        this.notifySyncStatus('connected');
    }
  }

  private handleConflict(conflictInfo: ConflictInfo) {
    console.warn('⚠️ Conflict detected:', conflictInfo);
    this.conflictListeners.forEach(listener => listener(conflictInfo));
  }

  on(eventKey: string, handler: Function) {
    if (!this.messageHandlers.has(eventKey)) {
      this.messageHandlers.set(eventKey, []);
    }
    this.messageHandlers.get(eventKey)!.push(handler);
  }

  off(eventKey: string, handler?: Function) {
    if (!handler) {
      this.messageHandlers.delete(eventKey);
    } else {
      const handlers = this.messageHandlers.get(eventKey);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  private triggerHandlers(eventKey: string, data: any) {
    const handlers = this.messageHandlers.get(eventKey);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  onSyncStatusChange(callback: (status: SyncStatusType) => void) {
    this.syncStatusCallbacks.push(callback);
  }

  private notifySyncStatus(status: SyncStatusType) {
    this.syncStatusCallbacks.forEach(callback => callback(status));
  }

  onConflict(listener: (conflict: ConflictInfo) => void) {
    this.conflictListeners.push(listener);
  }

  // Retry pending operations
  async retryPendingOperations(broadcastFn: Function) {
    for (const [entityId, operation] of this.pendingOperations) {
      try {
        await broadcastFn(operation);
        this.pendingOperations.delete(entityId);
        console.log(`✅ Retried operation for ${entityId}`);
      } catch (error) {
        console.error(`❌ Failed to retry operation for ${entityId}:`, error);
      }
    }
  }

  getPendingOperationsCount(): number {
    return this.pendingOperations.size;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const realtimeSync = new RealtimeSyncService(
  import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
);
