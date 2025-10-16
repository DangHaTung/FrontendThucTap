import { io } from 'socket.io-client';

class SocketService {
  private socket: any = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io('http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('Socket.IO reconnection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinCardRoom(cardId: string) {
    if (this.socket && this.socket.connected) {
      console.log('Joining card room:', cardId);
      this.socket.emit('join-card', cardId);
    } else {
      console.error('Socket not connected, cannot join room');
    }
  }

  leaveCardRoom(cardId: string) {
    if (this.socket && this.socket.connected) {
      console.log('Leaving card room:', cardId);
      this.socket.emit('leave-card', cardId);
    } else {
      console.error('Socket not connected, cannot leave room');
    }
  }

  onCommentAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('comment-added', callback);
    }
  }

  onCommentUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('comment-updated', callback);
    }
  }

  onCommentDeleted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('comment-deleted', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
