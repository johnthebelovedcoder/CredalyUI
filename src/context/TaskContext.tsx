"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface DashboardTask {
  id: string;
  name: string;
  progress: number;
  status: "pending" | "success" | "error";
  startedAt: Date;
}

interface TaskContextType {
  tasks: DashboardTask[];
  addTask: (name: string) => string;
  updateTask: (id: string, progress: number, status?: DashboardTask["status"]) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);

  const addTask = useCallback((name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newTask: DashboardTask = {
      id,
      name,
      progress: 0,
      status: "pending",
      startedAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return id;
  }, []);

  const updateTask = useCallback((id: string, progress: number, status?: DashboardTask["status"]) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, progress, status: status || t.status } : t
      )
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status === "pending"));
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, removeTask, clearCompleted }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
