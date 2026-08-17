import { generateSchemaTypes, generateReactQueryComponents } from "@openapi-codegen/typescript";
import { defineConfig } from "@openapi-codegen/cli";

const schemaUrl = (repository: string, filename: string) => {
  const refVariable = `OPENAPI_${repository.toUpperCase()}_REF`;
  const schemaRef = process.env[refVariable];
  if (!schemaRef || !/^[a-f0-9]{40}$/i.test(schemaRef)) {
    throw new Error(`${refVariable} must be an immutable 40-character Git commit SHA`);
  }

  return `https://raw.githubusercontent.com/wri/${repository}/${schemaRef}/docs/${filename}`;
};

export default defineConfig({
  api: {
    from: {
      source: "url",
      url: schemaUrl("fw_api", "fw_api.yaml")
    },
    outputDir: "src/generated/api",
    to: async context => {
      const filenamePrefix = "api";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  alerts: {
    from: {
      source: "url",
      url: schemaUrl("fw_alerts", "fw_alerts.yaml")
    },
    outputDir: "src/generated/alerts",
    to: async context => {
      const filenamePrefix = "alerts";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  teams: {
    from: {
      source: "url",
      url: schemaUrl("fw_teams", "fw_teams.yaml")
    },
    outputDir: "src/generated/teams",
    to: async context => {
      const filenamePrefix = "teams";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  exports: {
    from: {
      source: "url",
      url: schemaUrl("fw_exports", "fw_exports.yaml")
    },
    outputDir: "src/generated/exports",
    to: async context => {
      const filenamePrefix = "exports";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  forms: {
    from: {
      source: "url",
      url: schemaUrl("fw_forms", "fw_forms.yaml")
    },
    outputDir: "src/generated/forms",
    to: async context => {
      const filenamePrefix = "forms";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  core: {
    from: {
      source: "url",
      url: schemaUrl("fw_core", "fw_core.yaml")
    },
    outputDir: "src/generated/core",
    to: async context => {
      const filenamePrefix = "core";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  users: {
    from: {
      source: "url",
      url: schemaUrl("fw_users", "fw_users.yaml")
    },
    outputDir: "src/generated/users",
    to: async context => {
      const filenamePrefix = "users";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  },
  clayers: {
    from: {
      source: "url",
      url: schemaUrl("fw_contextual_layers", "fw_contextual_layers.yaml")
    },
    outputDir: "src/generated/clayers",
    to: async context => {
      const filenamePrefix = "clayers";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      });
    }
  }
});
