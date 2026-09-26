import { NodeRequest, sendNodeResponse } from "srvx/node";
import server from "../dist/server/server.js";

export default async function handler(req, res) {
  // Support Web Standard Request/Response (if called in Edge or Web runtime)
  if (!res && req && typeof req.headers?.get === "function") {
    return server.fetch(req);
  }

  // Node.js Serverless runtime (req: IncomingMessage, res: ServerResponse)
  try {
    const webReq = new NodeRequest({ req, res });
    const webRes = await server.fetch(webReq);
    return await sendNodeResponse(res, webRes);
  } catch (err) {
    console.error("Vercel SSR Handler Error:", err);
    if (res && !res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
}
