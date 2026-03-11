import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

const token = process.env.UPLOADTHING_TOKEN;
if (!token && process.env.NODE_ENV === "development") {
  console.warn(
    "[UploadThing] UPLOADTHING_TOKEN is not set. Add it to .env.local (get the v7 token from UploadThing Dashboard → API Keys → V7 tab), then restart the dev server."
  );
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: token ? { token } : undefined,
});
