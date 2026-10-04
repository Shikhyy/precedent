import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo-project-id";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-10-01";

// Read-only client for frontend and server-side re-validation
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_READ_TOKEN || undefined,
});

// Write client for administrative seeding (never exposed to client bundles)
export const getWriteClient = () => {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is required for write operations");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
};
