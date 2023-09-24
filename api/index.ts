import { Middleware } from "./lib/middleware/config";

Bun.serve({
  websocket: {
    message(ws, event) {},
    open(ws) {},
    close(ws, code, message) {},
    drain(ws) {},
  },
  async fetch(req) {
    const middleware = new Middleware(req);

    return middleware.processUrl();
  },
});
