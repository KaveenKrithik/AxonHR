import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Credential } from "@/types";

interface CredentialsState {
  credentials: Credential[];
  addCredential: (c: Omit<Credential, "id">) => string;
  updateCredential: (id: string, c: Partial<Credential>) => void;
  deleteCredential: (id: string) => void;
  getCredentialById: (id: string) => Credential | undefined;
}

export const useCredentialsStore = create<CredentialsState>()(
  persist(
    (set, get) => ({
      credentials: [
        { id: "default-smtp", name: "Corporate Gmail", type: "smtp", config: { host: "smtp.gmail.com", port: "587" } }
      ],
      addCredential: (c) => {
        const id = nanoid(8);
        set((s) => ({ credentials: [...s.credentials, { ...c, id }] }));
        return id;
      },
      updateCredential: (id, c) =>
        set((s) => ({
          credentials: s.credentials.map((x) => (x.id === id ? { ...x, ...c } : x)),
        })),
      deleteCredential: (id) =>
        set((s) => ({ credentials: s.credentials.filter((x) => x.id !== id) })),
      getCredentialById: (id) => get().credentials.find((x) => x.id === id),
    }),
    { name: "hr-flow-credentials" }
  )
);
