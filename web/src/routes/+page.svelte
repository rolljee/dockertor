<script lang="ts">
  import { onMount } from "svelte";
  import { apiData, containers } from "./store";
  import "../app.css";

  onMount(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/containers`)
      .then((res) => res.json())
      .then((data) => {
        const payload = JSON.parse(data);
        apiData.set(payload);
      })
      .catch((e) => console.error(e));
  });
</script>

<div class="container mx-auto">
  <div class="flex flex-col">
    {#each $containers as container}
      <div class="basis-1 p-3 m-3 rounded border">
        <div class="flex flex-row">
          <div class="rounded border bg-sky-500/50 m-1 p-1">
            {container.RunningFor}
          </div>
          <div class="rounded border bg-sky-500/50 m-1 p-1">
            {container.State}
          </div>
          <div class="rounded border bg-sky-500/50 m-1 p-1">
            {container.Status}
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Image</b></div>
          <div>
            <code>{container.Image}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Identifier</b></div>
          <div>
            {container.ID}
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Created</b> At</div>
          <div>
            <code>{container.CreatedAt}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Command</b></div>
          <div>
            <code>{container.Command}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Mounts</b></div>
          <div>
            {#each container.Mounts.split(",") as mount}
              <div class="flex flex-row">
                <div class="mr-1">{mount}</div>
              </div>
            {/each}
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Networks</b></div>
          <div>
            <code>{container.Networks}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Ports</b></div>
          <div>
            {#each container.Ports.split(",") as port}
              <div class="flex flex-row">
                <div class="mr-1">{port}</div>
              </div>
            {/each}
          </div>
        </div>
        

        <div class="flex flex-row">
          <div class="mr-1"><b>Size</b></div>
          <div>
            <code>{container.Size}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1"><b>Labels</b></div>
          <div>
            {#each container.Labels.split(",") as label}
              <div class="flex flex-row">
                <div class="mr-1">{label}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
