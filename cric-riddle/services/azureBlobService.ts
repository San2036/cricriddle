import { ContainerClient } from "@azure/storage-blob";
import type { User } from "../types";

// Configuration for browser-safe SAS token access
const STORAGE_ACCOUNT_NAME = (import.meta.env?.VITE_AZURE_STORAGE_ACCOUNT_NAME as string) || "cricriddle";
const CONTAINER_NAME = (import.meta.env?.VITE_AZURE_CONTAINER_NAME as string) || "cricriddle-container";
const SAS_TOKEN = (import.meta.env?.VITE_AZURE_SAS_TOKEN as string) || "";

const getContainerClient = (): ContainerClient | null => {
  if (!SAS_TOKEN) {
    console.warn("SAS token not configured; falling back to localStorage only");
    return null;
  }
  // Ensure token starts with ?
  const token = SAS_TOKEN.startsWith("?") ? SAS_TOKEN : `?${SAS_TOKEN}`;
  const url = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}${token}`;
  return new ContainerClient(url);
};

// Ensure the container exists (requires "c" permission in SAS)
const ensureContainerExists = async (client: ContainerClient) => {
  try {
    await client.createIfNotExists();
  } catch {
    /* ignore if creation fails (likely already exists or no perms) */
  }
};

const downloadText = async (blobName: string): Promise<string | null> => {
  const client = getContainerClient();
  if (!client) return null;
  await ensureContainerExists(client);
  const blob = client.getBlobClient(blobName);
  if (!(await blob.exists())) return null;
  const resp = await blob.download();
  return await resp.blobBody?.text() || null;
};

const uploadJson = async (blobName: string, data: unknown) => {
  const client = getContainerClient();
  if (!client) return;
  await ensureContainerExists(client);
  const block = client.getBlockBlobClient(blobName);
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  await block.uploadData(bytes, { blobHTTPHeaders: { blobContentType: "application/json" }, overwrite: true });
};

export const azureBlobService = {
  getUserData: async (username: string): Promise<User | null> => {
    try {
      const txt = await downloadText(`${username}.json`);
      return txt ? (JSON.parse(txt) as User) : null;
    } catch (err) {
      console.error("Azure getUserData error", err);
      return null;
    }
  },
  saveUserData: async (user: User) => {
    try {
      await uploadJson(`${user.username}.json`, user);
    } catch (err) {
      console.error("Azure saveUserData error", err);
    }
  },
};