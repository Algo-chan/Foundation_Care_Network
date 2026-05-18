import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
    const baseUrl = apiUrl.replace('/v1', '');
    socket = io(baseUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectToPublic(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join:public');
  }
  return s;
}

export function connectToDoctorRoom(doctorId: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  s.emit('join:doctor-room', doctorId);
  return s;
}

export function emitToggleAvailability(doctorId: string): Promise<{ success: boolean; isAvailable?: boolean; message?: string }> {
  return new Promise((resolve) => {
    const s = getSocket();
    if (!s.connected) {
      s.connect();
      s.emit('join:doctor-room', doctorId);
    }
    s.emit('doctor:toggle-availability', { doctorId });
    s.once('doctor:toggle-result', (result) => {
      resolve(result);
    });
    setTimeout(() => resolve({ success: false, message: 'Socket timeout' }), 5000);
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
