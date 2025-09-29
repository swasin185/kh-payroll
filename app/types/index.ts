
import type { $Fetch } from 'ofetch';

declare module '#app' {
  interface NuxtApp {
    $waitFetch: $Fetch;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $waitFetch: $Fetch;
  }
}