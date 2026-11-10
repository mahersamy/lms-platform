import nx from "@nx/eslint-plugin";

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    ignores: [
      "**/dist",
      "**/out-tsc",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints: [
            { sourceTag: "type:app", onlyDependOnLibsWithTags: ["type:feature", "type:infra", "type:shared"] },
            { sourceTag: "type:feature", onlyDependOnLibsWithTags: ["type:infra", "type:shared"] },
            { sourceTag: "type:infra", onlyDependOnLibsWithTags: ["type:infra", "type:shared"] },
            { sourceTag: "type:shared", onlyDependOnLibsWithTags: ["type:shared"] },
            { sourceTag: "type:e2e", onlyDependOnLibsWithTags: ["type:app"] },

            { sourceTag: "level:base", onlyDependOnLibsWithTags: ["level:base", "type:shared"] },
            { sourceTag: "level:service", onlyDependOnLibsWithTags: ["level:base", "type:shared"] },

            { sourceTag: "scope:identity", onlyDependOnLibsWithTags: ["scope:identity", "scope:shared"] },
            { sourceTag: "scope:courses", onlyDependOnLibsWithTags: ["scope:courses", "scope:shared"] },
            { sourceTag: "scope:enrollments", onlyDependOnLibsWithTags: ["scope:enrollments", "scope:shared"] },
            { sourceTag: "scope:assessments", onlyDependOnLibsWithTags: ["scope:assessments", "scope:shared"] },
            { sourceTag: "scope:billing", onlyDependOnLibsWithTags: ["scope:billing", "scope:shared"] },

            { sourceTag: "scope:shared", onlyDependOnLibsWithTags: ["scope:shared"] },
          ],
        },
      ],
    },
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
    ],
    // Override or add rules here
    rules: {},
  },
];
