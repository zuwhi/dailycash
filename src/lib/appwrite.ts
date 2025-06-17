import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable");
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable",
  );
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable",
  );
}

if (!process.env.NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION environment variable",
  );
}
if (!process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION environment variable",
  );
}

if (!process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_BUCKET_ID environment variable",
  );
}

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const COLLECTION_TRANSACTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION;
export const COLLECTION_CATEGORY_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION;
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export { ID, Query };
