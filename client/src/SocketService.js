import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); 

const SocketService = {
  connect: () => {
    socket.connect();
    console.log('Connected with Server')
  },

  disconnect: () => {
    socket.disconnect();
    console.log('Disconnected with Server')
  },

  on: (eventName, callback) => {
    socket.on(eventName, callback);
  },

  off: (eventName, callback) => {
    socket.off(eventName, callback);
  },

  emit: (eventName, data) => {
    socket.emit(eventName, data);
    console.log('Emitting data to server')
  },
};

export default SocketService;
