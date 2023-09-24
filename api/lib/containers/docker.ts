export class DockerService {
  constructor() {}

  async getContainersInformations() {
    const proc = Bun.spawn([
      "docker",
      "ps",
      "--all",
      "--no-trunc",
      "--format='{{json .}}'",
    ]);

    const output = await new Response(proc.stdout).text();

    const containers = output
      .split("\n")
      .filter(Boolean)
      .map((line) => line.replace(/'/g, ""))
      .map((line) => JSON.parse(line));

    return JSON.stringify(containers);
  }
}
