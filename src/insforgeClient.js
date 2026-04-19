import { createClient } from "@insforge/sdk";

export const insforgeConfig = {
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || "",
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || "",
};

export const isInsforgeConfigured = Boolean(
  insforgeConfig.baseUrl && insforgeConfig.anonKey,
);

export const insforge = isInsforgeConfigured
  ? createClient({
      baseUrl: insforgeConfig.baseUrl,
      anonKey: insforgeConfig.anonKey,
    })
  : null;
