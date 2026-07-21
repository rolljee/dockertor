export interface Container {
  ID: string;
  Names: string;
  Image: string;
  Command: string;
  CreatedAt: string;
  RunningFor: string;
  Status: string;
  State: string;
  Ports: string;
  Mounts: string;
  Networks: string;
  Labels: string;
  Size: string;
  LocalVolumes: string;
}

export class DockerService {
  /**
   * Returns every container (running or not) using `docker ps`.
   * Output is requested as one JSON object per line so we can parse it
   * without fragile string manipulation.
   */
  async getContainersInformations(): Promise<Container[]> {
    const proc = Bun.spawn(
      ["docker", "ps", "--all", "--no-trunc", "--format", "{{json .}}"],
      { stderr: "pipe" },
    );

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (exitCode !== 0) {
      throw new Error(
        `\`docker ps\` failed (exit ${exitCode}): ${stderr.trim() || "unknown error"}`,
      );
    }

    return stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Container);
  }
}
