import { DockerService } from "../containers/docker";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export class Middleware {
  url: URL;
  method: string;
  dockerService: DockerService;

  constructor(req: Request) {
    this.url = new URL(req.url);
    this.method = req.method;
    this.dockerService = new DockerService();
  }

  async processUrl(): Promise<Response> {
    // CORS preflight
    if (this.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (this.url.pathname === "/" || this.url.pathname === "/health") {
      return Response.json({ status: "ok" }, { headers: CORS_HEADERS });
    }

    if (this.url.pathname === "/api/containers") {
      try {
        const containers = await this.dockerService.getContainersInformations();
        return Response.json(containers, { headers: CORS_HEADERS });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return Response.json(
          { error: message },
          { status: 502, headers: CORS_HEADERS },
        );
      }
    }

    return Response.json(
      { error: "Not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }
}
