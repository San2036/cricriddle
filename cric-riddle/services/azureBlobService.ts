import { BlobServiceClient } from "@azure/storage-blob";
import type { User } from "../types";

// The connection string to your Azure Storage account must be provided via
// an environment variable. In local development you can add it to .env.local
// as AZURE_STORAGE_CONNECTION_STRING=...
// In a Vite + React app, environment variables that need to be available in the
// browser bundle must be prefixed with VITE_. They are exposed via `import.meta.env`.
// We still fallback to `process.env` so the same code works in Node scripts/tests.
// Prefer Vite env then Node env for Azure Storage connection string
const CONNECTION_STRING =
  (import.meta.env?.VITE_AZURE_STORAGE_CONNECTION_STRING as string | undefined) ||
  (process.env.AZURE_STORAGE_CONNECTION_STRING as string | undefined) ||
  "";

// Container where all user JSON blobs will live
const CONTAINER_NAME = "users";

/**
 * Returns an Azure container client, creating the container if it does not yet exist.
 * If the connection string is not configured, the function returns null so that the
 * caller can gracefully degrade to localStorage or another fallback.
 */
const getContainerClient = async () => {
  if (!CONNECTION_STRING) return null;
  const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  // In browser context we avoid attempting to create the container because the
  // SAS token may not include the required permissions and the PUT request
  // triggers a CORS pre-flight. Make sure the container exists ahead of time.
  // If you still want automatic creation in a trusted Node environment you can
  // call `containerClient.createIfNotExists()` there instead.
  return containerClient;
};

/**
 * Download a blob's text content. Returns null if blob not found or storage disabled.
 */
const downloadText = async (blobName: string): Promise<string | null> => {
  const containerClient = await getContainerClient();
  if (!containerClient) return null;
  const blobClient = containerClient.getBlobClient(blobName);
  if (!(await blobClient.exists())) return null;
  const resp = await blobClient.download();
  const text = await resp.blobBody?.text();
  return text ?? null;
};

/**
 * Upload JSON data to the container (overwrites if already exists).
 */
const uploadJson = async (blobName: string, data: unknown): Promise<void> => {
  const containerClient = await getContainerClient();
  if (!containerClient) return;
  const blockBlob = containerClient.getBlockBlobClient(blobName);
  const body = JSON.stringify(data);
  const bytes = new TextEncoder().encode(body);
  await blockBlob.uploadData(bytes, {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
};

export const azureBlobService = {
  /** Retrieve a user's record from Azure Blob storage. */
  getUserData: async (username: string): Promise<User | null> => {
    try {
      const txt = await downloadText(`${username}.json`);
      return txt ? (JSON.parse(txt) as User) : null;
    } catch (err) {
      console.error("Azure getUserData error", err);
      return null;
    }
  },

  /** Persist a user's record to Azure Blob storage. */
  saveUserData: async (user: User): Promise<void> => {
    try {
      await uploadJson(`${user.username}.json`, user);
    } catch (err) {
      console.error("Azure saveUserData error", err);
    }
  },
};