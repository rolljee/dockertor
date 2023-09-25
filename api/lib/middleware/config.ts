import { DockerService } from "../containers/docker";

export class Middleware {
  url: URL;
  dockerService: DockerService;

  constructor(req: Request) {
    this.url = new URL(req.url);

    this.dockerService = new DockerService();
  }

  async processUrl() {
    if (this.url.pathname === "/") {
      return new Response("Hello world!");
    }

    if (this.url.pathname === "/api/containers") {
      const containers = await this.dockerService.getContainersInformations();
      const payload = JSON.stringify(containers);
      const response = Response.json(payload, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });

      return response;
    }

    return new Response("Not found", { status: 404 });
  }
}
