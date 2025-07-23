import sveltePreprocess from 'svelte-preprocess';

const config = {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    typescript: true
  })
};

export default config;