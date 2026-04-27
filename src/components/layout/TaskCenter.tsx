"use client";

import { useState } from "react";
import { useTasks } from "@/context/TaskContext";
import { Bell, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";

const C = {
  s1: "#0C1A30",
  s2: "#112240",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
};

export function TaskCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks, clearCompleted } = useTasks();

  const activeCount = tasks.filter(t => t.status === "pending").length;

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: "transparent", 
          border: "none", 
          color: C.muted, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center",
          position: "relative",
          padding: 8
        }}
      >
        <Bell size={20} />
        {activeCount > 0 && (
          <span style={{ 
            position: "absolute", 
            top: 4, 
            right: 4, 
            background: C.amber, 
            color: "#06101E", 
            fontSize: 9, 
            fontWeight: 800, 
            borderRadius: "50%", 
            width: 14, 
            height: 14, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
          />
          <div style={{ 
            position: "absolute", 
            top: 48, 
            right: 0, 
            width: 320, 
            background: C.s1, 
            border: `1px solid ${C.border}`, 
            borderRadius: 16, 
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            zIndex: 100,
            overflow: "hidden"
          }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(100,140,200,0.03)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Background Tasks</span>
              <button 
                onClick={clearCompleted}
                style={{ background: "transparent", border: "none", color: C.faint, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Trash2 size={12}/> Clear Completed
              </button>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
              {tasks.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <Clock size={24} color={C.faint} style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 12, color: C.faint, margin: 0 }}>No active background tasks</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} style={{ padding: "12px 18px", borderBottom: `1px solid rgba(100,140,200,0.05)` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{task.name}</span>
                      {task.status === "success" ? (
                        <CheckCircle size={14} color={C.teal} />
                      ) : task.status === "error" ? (
                        <XCircle size={14} color={C.red} />
                      ) : (
                        <span style={{ fontSize: 10, color: C.amber, fontWeight: 600 }}>{Math.round(task.progress)}%</span>
                      )}
                    </div>
                    {task.status === "pending" && (
                      <div style={{ height: 4, background: C.s2, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: C.amber, width: `${task.progress}%`, transition: "width 0.3s" }} />
                      </div>
                    )}
                    <span style={{ fontSize: 10, color: C.faint, marginTop: 4, display: "block" }}>
                      ID: {task.id} · Started {new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ padding: "12px 18px", background: C.s2, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Auto-cleaning completed jobs after 10m</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
