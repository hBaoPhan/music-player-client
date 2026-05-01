import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [onlineCount, setOnlineCount] = useState(0);
    const stompClientRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        // Only connect if user is logged in
        if (!token || !currentUser) {
            if (stompClientRef.current) {
                console.log('Deactivating Global WebSocket due to logout/no-token');
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            return;
        }

        // Avoid duplicate connections
        if (stompClientRef.current?.active) return;

        console.log('Initializing Global WebSocket for user:', currentUser.username);
        const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log('Connected to Global WebSocket');
                client.subscribe('/topic/online-users', (message) => {
                    setOnlineCount(parseInt(message.body));
                });
            },
            onStompError: (frame) => {
                console.error('WebSocket Broker reported error:', frame.headers['message']);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            // Clean up connection on component unmount
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [currentUser]);

    return (
        <SocketContext.Provider value={{ onlineCount }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
