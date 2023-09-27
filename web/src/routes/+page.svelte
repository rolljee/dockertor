<script lang="ts">
  import { onMount } from "svelte";
  import { apiData, containers } from "./store";
  import "../app.css";

  onMount(() => {
    fetch("http://localhost:3000/api/containers")
      .then((res) => res.json())
      .then((data) => {
        const payload = JSON.parse(data);
        console.log(payload);
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
          <div class="rounded border bg-sky-500/50 m-1 p-1">{container.RunningFor}</div>
          <div class="rounded border bg-sky-500/50 m-1 p-1">{container.State}</div>
          <div class="rounded border bg-sky-500/50 m-1 p-1">{container.Status}</div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Image</div>
          <div>
            <code>{container.Image}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Identifier</div>
          <div>
            {container.ID}
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Created At</div>
          <div>
            <code>{container.CreatedAt}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Command</div>
          <div>
            <code>{container.Command}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Mounts</div>
          <div>
            <code>{container.Mounts}</code>
          </div>
        </div>


        <div class="flex flex-row">
          <div class="mr-1">Networks</div>
          <div>
            <code>{container.Networks}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Ports</div>
          <div>
            <code>{container.Ports}</code>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="mr-1">Size</div>
          <div>
            <code>{container.Size}</code>
          </div>
        </div>
        <div class="flex flex-row">
          <div class="mr-1">Labels</div>
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
