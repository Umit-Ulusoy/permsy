export { default as Permsy } from "./core/Permsy.js";

// 2. Helper Functions
export { definePermissionConfig } from "./defines.js";

// 3. User Configuration Types
export type {
  PermissionConfigInput,
  CommandCategoriesInput,
  CommandRuleInput,
  GroupRuleInput,
} from "./types.js";

// 4. Adapter & Engine Types
export type {
  BaseAdapter,
  AdapterContext,
  ConfigOptions,
  EngineResult,
} from "./types.js";