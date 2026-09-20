# Permsy

A flexible, type-safe, and framework-agnostic permission management engine designed for Discord bots and multi-platform applications.

Permsy simplifies authorization by decoupling permission logic from core application code. Define centralized access control rules, role restrictions, channel limits, user whitelists, and custom rules in a clean, maintainable configuration.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration-permsyconfigjs)
- [Command Rule Types & Formats](#command-rule-types--formats)
- [Comprehensive Configuration Examples](#comprehensive-configuration-examples)
- [Group & Command Rule Merging](#group--command-rule-merging)
- [Rule Evaluation Order](#rule-evaluation-order)
- [Custom Adapter Systems](#custom-adapter-systems)

## Features

- **Framework Agnostic**: Seamless integration with discord.js, Eris, or custom bot libraries via adapters.
- **Zero-Boilerplate Integration**: Works with both traditional Prefix commands and modern Slash (Interaction) commands seamlessly.
- **Type-Safe Configuration**: Autocomplete and strict type checks using `definePermissionConfig`.
- **Granular Rules**: Restrict commands by roles, permissions, channels, or users.
- **Flexible Rule Syntax**: Supports string lists, arrays, comma-separated values, and object metadata arrays.
- **Inheritance & Hierarchy**: Command-level rules can extend or overwrite group-level configurations.
- **Smart Deny Message Fallback**: Customizable error messages at global, command, or execution levels.

## Installation

```bash
npm install permsy @permsy/adapter-discordjs
```

## Quick Start

### 1. Initialize Permsy

Initialize Permsy inside your main application file:

```js
import { Client, GatewayIntentBits } from 'discord.js';
import { Permsy } from 'permsy';
import { DiscordJsAdapter } from '@permsy/adapter-discordjs';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize the adapter
const adapter = new DiscordJsAdapter();

const permsy = new Permsy({
  adapter,
  configDir: './', // Root directory
  fileName: 'permsy.config.js',
});
```

### 2. Guard Commands in Event Handlers

Permsy automatically intercepts unauthorized users, dispatches configured `denyMessage` responses, and returns `false`.

#### Slash Commands (`interactionCreate`)

```js
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  // Permsy automatically detects interaction types and checks permissions
  const isAllowed = await permsy.isAllowed(interaction);
  if (!isAllowed) return; // Deny response is automatically sent if unauthorized

  await command.execute(interaction);
});
```

> **Note - Default Allow Behaviour:** Only commands explicitly added to a rule type are protected; unlisted commands remain public.

#### Prefix Commands (`messageCreate`)

```js
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  // Pass source message and command name for prefix resolution
  const isAllowed = await permsy.isAllowed({
    message,
    commandName,
  });
  if (!isAllowed) return; // Deny response automatically sent if unauthorized

  await command.execute(message, args);
});
```

## Configuration (`permsy.config.js`)

Create a `permsy.config.js` file at your root directory using `definePermissionConfig` for full IDE type safety.

```js
import { definePermissionConfig } from 'permsy';

export const permissionConfig = definePermissionConfig({
  defaultDenyMessage: "You don't have permission to execute this command!",
  commands: {
    prefixes: {},
    slashes: {},
    groups: [],
  },
});
```

## Command Rule Types & Formats

Every command block (`prefixes`, `slashes`, or `groups`) supports four core constraint types: `rolesOnly`, `permissionsOnly`, `channelsOnly`, and `usersOnly`.

To provide maximum developer flexibility, Permsy accepts three syntax formats for any rule:

**1. Array of Strings**

```js
rolesOnly: ["123456789012345678", "987654321098765432"]
```

**2. Comma-Separated String**

```js
permissionsOnly: "ADMINISTRATOR, MANAGE_GUILD, BAN_MEMBERS"
```

**3. Object Array with Metadata (Documentary Style)**

> Metadata properties like `name` are ignored during evaluation and serve purely as documentation for your team.

```js
usersOnly: [
  { id: "210481204981048", name: "Sezer" },
  { id: "95810293810293", name: "Ümit" }
]
```

## Comprehensive Configuration Examples

### Prefix Command Rules

```js
import { definePermissionConfig } from 'permsy';

export const permissionConfig = definePermissionConfig({
  defaultDenyMessage: 'Access Denied: You cannot use this command.',
  commands: {
    prefixes: {
      ban: {
        permissionsOnly: ['BAN_MEMBERS'],
        denyMessage: 'You need the "BAN_MEMBERS" permission to use this.',
      },
      vip: {
        rolesOnly: '112233445566778899',
        channelsOnly: [
          { id: '998877665544332211', name: 'vip-lounge' }
        ],
      },
      owner: {
        usersOnly: [
          { id: '123456789', name: 'Lead Developer' }
        ],
      },
    },
  },
});
```

### Slash Command Rules

Slash command rules mirror prefix definitions identically under the `slashes` section:

```js
commands: {
  slashes: {
    timeout: {
      permissionsOnly: "MODERATE_MEMBERS",
      rolesOnly: ["ADMIN_ROLE_ID", "MOD_ROLE_ID"],
      denyMessage: "Only moderators and admins can use /timeout.",
    },
  },
}
```

### Group Rules (Cross-Type Authorization)

Use groups when prefix and slash variations of a command share identical permission configurations:

```js
commands: {
  groups: [
    {
      commands: ["ban", "kick", "mute"], // Applies to both !ban and /ban
      rolesOnly: ["MOD_ROLE_ID"],
      permissionsOnly: ["KICK_MEMBERS", "BAN_MEMBERS"],
      denyMessage: "Group Permission Error: Insufficient Staff Role.",
    },
  ],
}
```

## Group & Command Rule Merging

When a command name appears in both a group and its own `prefixes`/`slashes` entry, Permsy merges the two rule sets field by field:

- **Same field defined in both** → the command-level value **overwrites** the group-level value entirely (it does not combine the two).
- **Field defined only at the group level** → it still applies, since the command doesn't override it.
- **Field defined only at the command level** → it **extends** the group's rules by adding a new constraint on top of the group's existing ones.

```js
commands: {
  groups: [
    {
      commands: ["ban", "kick"],
      rolesOnly: ["MOD_ROLE_ID"],
      permissionsOnly: ["KICK_MEMBERS", "BAN_MEMBERS"],
      denyMessage: "Group Permission Error: Insufficient Staff Role.",
    },
  ],
  prefixes: {
    ban: {
      rolesOnly: ["SENIOR_MOD_ROLE_ID"], // Overwrites the group's rolesOnly
      channelsOnly: ["mod-log-channel-id"], // Extends the group with a new constraint
    },
  },
}
```

For the `ban` command in this example, the effective rules become:

```js
{
  rolesOnly: ["SENIOR_MOD_ROLE_ID"],       // from the command, overwrites the group's value
  permissionsOnly: ["KICK_MEMBERS", "BAN_MEMBERS"], // inherited from the group, untouched
  channelsOnly: ["mod-log-channel-id"],    // new constraint added by the command
  denyMessage: "Group Permission Error: Insufficient Staff Role.", // inherited from the group
}
```

The `kick` command, having no command-level override, keeps using the group's rules exactly as defined.

## Rule Evaluation Order

Permsy evaluates rules in a fixed, predictable order:

1. **Channel Restriction (`channelsOnly`)** - Checked first, and mandatory when present. If the command is defined with a channel restriction and the current channel doesn't match, the command is denied immediately - no other rule can override this.
2. **Identity Rules (`usersOnly`, `rolesOnly`, `permissionsOnly`)** - Evaluated only after the channel check passes. These are combined with **OR** logic: if *any* of the defined identity rules match, the command is allowed.

If a command has no rules defined at all, it remains publicly accessible (see the Default Allow Behaviour note above).

### Deny Message Resolution

Messages resolve in order of specificity:

**Command Deny Message ➔ Group Deny Message ➔ Global `defaultDenyMessage`**

```js
export const permissionConfig = definePermissionConfig({
  defaultDenyMessage: "Global Error: No access.", // Level 3 Fallback
  commands: {
    prefixes: {
      ping: {
        // Uses defaultDenyMessage
      },
      admin: {
        denyMessage: "Custom Error: Admin command only!", // Overrides Level 3
      }
    }
  }
});
```

## Custom Adapter Systems

You can build custom adapters for any library (e.g., Eris, discord.js, custom HTTP bots) by implementing the `BaseAdapter` interface:

```ts
import type { BaseAdapter, AdapterContext } from 'permsy';

export class CustomBotAdapter implements BaseAdapter {
  async resolveContext(context: unknown): Promise<AdapterContext> {
    // Extract userId, member roles, and permissions from context
  }

  async sendDenyMessage(context: unknown, message: string): Promise<void> {
    // Custom response dispatching logic
  }
}
```

## Special Thanks

Thanks to the Nextgen framework and Burak B. for the project idea.