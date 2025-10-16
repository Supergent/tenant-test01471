"use client";

import * as React from "react";
import { ToastProvider } from "./toast";

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ToastProvider>{children}</ToastProvider>;
};
