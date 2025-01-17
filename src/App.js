import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

  const handleEvent = useCallback((eventType, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[🔵 FRONTEND RECEIVED] ${eventType} | Data:`, data);

    setEvents((prev) => [
      { type: eventType, data, timestamp },
      ...prev.slice(0, 49),
    ]);
  }, []);

  useEffect(() => {
    const authToken =  'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiOGMwY2UyZjEtN2RhMy00Y2FmLTlmZjktYjlkY2EyNWQzNzI4IiwiZXhwIjoxNzM3MTYwODMyfQ.5Uj3nGgg7G-u2pvNzVwgjTZws1YoedtOffloU7V2YKU';

    const socket = io("http://localhost:5000", {
      auth: { token: authToken },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      setConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket Connection Error:", error);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket Disconnected");
      setConnected(false);
    });

    const eventTypes = [
      "bet_created",
      "bet_updated",
      "bet_deleted",
      "bet_winning_updated",
      "event_created",
      "event_updated",
      "event_deleted",
      "leaderboard_updated",
    ];

    eventTypes.forEach((eventType) => {
      socket.on(eventType, (data) => handleEvent(eventType, data));
    });

    return () => {
      eventTypes.forEach((eventType) => {
        socket.off(eventType);
      });
      socket.disconnect();
    };
  }, [handleEvent]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-Time Event Viewer</h1>
        <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <strong>
                {event.type} ({event.timestamp})
              </strong>
              : {JSON.stringify(event.data)}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
