import { defineConfig} from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: 'http://host.docker.internal:8000/openapi.json',
  output: {path: 'src/api', 
    lint: "biome",
    format: "biome",
  },
  services: {
    asClass: true,
    // Really jank unfortunately, there is no way to preprocess input, 
    // so we have to find the index of '-' in the generated name and take the subslice from that index onwards
    // Now almost all routes have nice names (except auth, but it was extra jank to begin with)
    methodNameBuilder: (operation) => {const str = operation.name.substring(operation.id
      ?.replace(/\s/g, "") // Whitespaces are stripped in the final name, which we need to account for
      .indexOf("-") ?? 0 + 1 // If the operation is category-less (which some are for some reason), we take the whole string
      , operation.name.length);
      return str[0].toLowerCase() + str.substring(1) // First letter shold be lowercase, but since we stripped the first word we do this manually
    }
  },
  types: {
    dates: "types",
    enums: "typescript",

  }
});
