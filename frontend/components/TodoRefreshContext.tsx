"use client";

import { createContext, useContext } from "react";

export const TodoRefreshContext = createContext<() => void>(() => {});

export function useTodoRefresh() {
  return useContext(TodoRefreshContext);
}
