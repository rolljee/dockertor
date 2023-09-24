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

    if (this.url.pathname === "/docker/containers") {
      const containers = await this.dockerService.getContainersInformations();

      return new Response(containers, {
        headers: {
          "content-type": "application/json",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
