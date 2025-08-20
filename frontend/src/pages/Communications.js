// src/pages/Communications.js
import React, { useEffect, useState } from "react";
import {
  getCommunications,
  sendCommunication,
  replyToClient,
  replyToAgent,
  messageAdmin,
} from "../services/communicationService";
import { getUserProfile } from "../services/authService";

export default function Communications() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getCommunications();
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching communications:", err);
    }
  };

  useEffect(() => {
    getUserProfile().then(setUser).catch(console.error);
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      if (user.role === "client" || user.role === "agent") {
        // send to admin
        await messageAdmin(newMsg);
      } else {
        // fallback: use base create (admin can broadcast or set recipient)
        await sendCommunication({ message: newMsg });
      }
      setNewMsg("");
      fetchData();
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleReply = async (m) => {
    const reply = prompt("Enter reply:");
    if (!reply) return;

    try {
      if (user.role === "admin") {
        if (m.sender_role === "agent") {
          await replyToAgent(m.sender, reply);
        } else if (m.sender_role === "client") {
          await replyToClient(m.sender, reply);
        }
      } else if (user.role === "agent" && m.sender_role === "client") {
        await replyToClient(m.sender, reply);
      }
      fetchData();
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Communications</h2>

      {/* Send new */}
      <form onSubmit={handleSend} style={{ marginBottom: 20 }}>
        <textarea
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "100%", minHeight: 80 }}
        />
        <button type="submit">Send</button>
      </form>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <p>
              <strong>{m.sender_name}</strong> ({m.sender_role}) →{" "}
              {m.recipient_name || (m.broadcast_to_agents ? "All Agents" : "—")}
            </p>
            <p>{m.message}</p>
            <small>{new Date(m.created_at).toLocaleString()}</small>

            {/* Reply option */}
            {user && user.role !== "client" && (
              <div>
                <button onClick={() => handleReply(m)}>Reply</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
