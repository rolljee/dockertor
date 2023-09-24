<script lang="ts">
  import { onMount } from "svelte";

  onMount(async () => {
    try {
      const containers = await fetch("http://localhost:3000/docker/containers");
      console.log(containers);
    } catch (e) {
      console.error(e);
    }
  });
</script>

containers page
