// src/context/SocketContext.jsx
// Real-time socket connection — matches socket events in driverController.js

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children, driverId }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [newAssignment, setNewAssignment] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005';
    socketRef.current = io(SOCKET_URL, { autoConnect: true });

    const socket = socketRef.current;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Driver receives new order offer from autoAssignmentService
    socket.on('new_assignment', (data) => {
      setNewAssignment(data);
    });

    // Join driver room once connected
    if (driverId) {
      socket.emit('join', `driver_${driverId}`);
    }

    return () => socket.disconnect();
  }, [driverId]);

  // Emit driver online — mirrors driverController socket handler
  const goOnline = (driverId, location) => {
    socketRef.current?.emit('driver_online', { driverId, location });
  };

  const goOffline = (driverId) => {
    socketRef.current?.emit('driver_offline', { driverId });
  };

  const respondToOrder = (driverId, orderId, response) => {
    socketRef.current?.emit('order_response', { driverId, orderId, response });
  };

  const emitLocation = (driverId, location) => {
    socketRef.current?.emit('location_update', { driverId, location });
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      newAssignment,
      clearAssignment: () => setNewAssignment(null),
      goOnline,
      goOffline,
      respondToOrder,
      emitLocation,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);