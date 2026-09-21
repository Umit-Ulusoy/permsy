import { describe, it, expect } from "vitest";
import { Parser } from "../src/core/Parser.ts";

describe('Test behaviour of the normalizeRuleValue function', () => {

  it('should return an empty array when given null or undefined', () => {
    expect(Parser.normalizeRuleValue(null)).toEqual([]);
    expect(Parser.normalizeRuleValue(undefined)).toEqual([]);
  });

  it('should throw an error when given an object', () => {
    expect(() => Parser.normalizeRuleValue({ id: "123123", name: "Smiling cat" } as any)).toThrow(
        /Only string or array are accepted/
    );
  });

  it('should throw an error when given a number', () => {
    expect(() => Parser.normalizeRuleValue(123 as any)).toThrow(
      /Only string or array are accepted/
    );
  });

  it('should return an array with string type IDs when given an array with strings including ID and name fields', () => {

const ruleValue = [
    { id: "123", name: "Angry cat" },
    { id: "456", name: "Angry cat's buddy" }
];
const result = ["123", "456"];

expect(Parser.normalizeRuleValue(ruleValue)).toEqual(result);
  });

  it('should return an array with string type Ids', () => {

    const ruleValue = "123, 456,789,    000   ";
    const result = ["123", "456", "789", "000"];

    expect(Parser.normalizeRuleValue(ruleValue)).toEqual(result);
  });

  it('should throw an error when given an array with empty strings', () => {
    expect(() => Parser.normalizeRuleValue(["", ""])).toThrow(
        /Value must be a string or \{ id: string \}/
    );
  });

});

describe('parseCommandRules()', () => {

  it('should throw an error when given a denyMessage with number', () => {
    const commandRules = {
      denyMessage: 123
    };

    expect(() => Parser.parseCommandRules(commandRules)).toThrow(
      /Invalid command rule: denyMessage must be a string/
    );
  });

    it('should throw an error when given null or undefined', () => {
    expect(() => Parser.parseCommandRules(null as any)).toThrow(
      /Invalid command rules: Rules must be an object/
    );
    expect(() => Parser.parseCommandRules(undefined as any)).toThrow(
      /Invalid command rules: Rules must be an object/
    );
  });

  it('should return an empty object when given an empty object', () => {
expect(Parser.parseCommandRules({})).toEqual({});
  });

  it('should throw an error when given an array', () => {
    expect(() => Parser.parseCommandRules([])).toThrow(
      /Invalid command rules: Rules must be an object/
    )
  });

  it('should throw an error when given a number', () => {
    expect(() => Parser.parseCommandRules(123)).toThrow(
      /Invalid command rules: Rules must be an object/
    )
  });

  it('should throw an error when given an invalid rule', () => {

const rules = {
  rolesOnly: "123,456",
  onlyYou: "YOU"
};

    expect(() => Parser.parseCommandRules(rules)).toThrow(
      /Unknown command rule definition/
    );
  });

  it('should return parsed rules', () => {

    const rules = {
      rolesOnly: "123, 456,    789",
      usersOnly: [
        { id: "1", name: "Angry Cat" },
        { id: "2", name: "smily cat" }
      ],
channelsOnly: ["123", "456"],
permissionsOnly: ["ADMINISTRATOR", "BAN_USER"]
};

    const expected = {
      rolesOnly: ["123", "456", "789"],
      usersOnly: ["1", "2"],
      channelsOnly: ["123", "456"],
      permissionsOnly: ["ADMINISTRATOR", "BAN_USER"]
    };

expect(Parser.parseCommandRules(rules)).toEqual(expected);
  });

});

describe('parseGroupRules()', () => {

  it('should throw an error when given a denyMessage with number', () => {
    const commandRules = {
commands: [],
      denyMessage: 123
    };

    expect(() => Parser.parseGroupRules(commandRules)).toThrow(
      /Invalid group rule: denyMessage must be a string/
    );
  });

    it('should throw an error when given null or undefined', () => {
    expect(() => Parser.parseGroupRules(null as any)).toThrow(
      /Invalid group rules: Rules must be an object/
    );
    expect(() => Parser.parseGroupRules(undefined as any)).toThrow(
      /Invalid group rules: Rules must be an object/
    );
  });

  it('should throw an error when commands is missing', () => {
    expect(() => Parser.parseGroupRules({})).toThrow(
        /Invalid group rule: 'commands' array is required/
    );
});

  it('should throw an error when given an array', () => {
    expect(() => Parser.parseGroupRules([])).toThrow(
      /Invalid group rules: Rules must be an object/
    )
  });

  it('should throw an error when given a number', () => {
    expect(() => Parser.parseGroupRules(123)).toThrow(
      /Invalid group rules: Rules must be an object/
    )
  });

  it('should throw an error when given an invalid rule', () => {

const rules = {
commands: [],
  rolesOnly: "123,456",
  onlyYou: "YOU"
};

    expect(() => Parser.parseGroupRules(rules)).toThrow(
      /Unknown group rule definition/
    );
  });

  it('should return parsed rules', () => {

    const rules = {
      commands: "ban, kick",
      rolesOnly: "123, 456,    789",
      usersOnly: [
        { id: "1", name: "Angry Cat" },
        { id: "2", name: "smily cat" }
      ],
channelsOnly: ["123", "456"],
permissionsOnly: ["ADMINISTRATOR", "BAN_USER"]
};

    const expected = {
      commands: ["ban", "kick"],
      rolesOnly: ["123", "456", "789"],
      usersOnly: ["1", "2"],
      channelsOnly: ["123", "456"],
      permissionsOnly: ["ADMINISTRATOR", "BAN_USER"]
    };

expect(Parser.parseGroupRules(rules)).toEqual(expected);
  });

});

describe('parsePermissionConfig', () => {

  it('should throw an error when given defaultDenyMessage as a number', () => {
    const permsConfig = {
      defaultDenyMessage: 123,
      commands: {}
    };

    expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
      /Invalid configuration: 'defaultDenyMessage' must be a non-empty string/
    );
  });

  it('should throw an error when given defaultDenyMessage as an array', () => {
    const permsConfig = {
      defaultDenyMessage: [],
      commands: {}
    };

    expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
      /Invalid configuration: 'defaultDenyMessage' must be a non-empty string/
    );
  });

  it('should throw an error when given defaultDenyMessage as an object', () => {
    const permsConfig = {
      defaultDenyMessage: {},
      commands: {}
    };

    expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
      /Invalid configuration: 'defaultDenyMessage' must be a non-empty string/
    );
  });

  it('should return an error requiring defaultDenyMessage field when given an empty object', () => {
    expect(() => Parser.parsePermissionConfig({})).toThrow(
      /Invalid configuration: 'defaultDenyMessage' must be a non-empty string/
    );
  });

  it('should throw an error when given an array instead of an object', () => {
    expect(() => Parser.parsePermissionConfig([])).toThrow(
      /Invalid configuration: Configuration must be an object/
    );
  });

  it('should throw an error when given undefined or null values', () => {
    expect(() => Parser.parsePermissionConfig(null)).toThrow(
      /Invalid configuration: Configuration must be an object/
    );
    expect(() => Parser.parsePermissionConfig(undefined)).toThrow(
      /Invalid configuration: Configuration must be an object/
    );
  });

  it('should throw an error when given an invalid command category', () => {
    const permsConfig = {
      defaultDenyMessage: "Angry Cat",
      commands: {
        prefixes: {},
        slashes: {},
        groups: [],
        smilingCats: []
      }
    };

    expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
      /Invalid category type:/
    );
  });

  it('should throw an error when given groups as an object', () => {
    
    const permsConfig = {
      defaultDenyMessage: "Smily Cat",
      commands: {
        groups: {}
      }
    }

      expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
        /Invalid category type: 'groups' must be an array/
      );
  });

    it('should throw an error when given groups as a string', () => {
    
    const permsConfig = {
      defaultDenyMessage: "Smily Cat",
      commands: {
        groups: ""
      }
    }

      expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
        /Invalid category type: 'groups' must be an array/
      );
  });

    it('should throw an error when given groups as a number', () => {
    
    const permsConfig = {
      defaultDenyMessage: "Smily Cat",
      commands: {
        groups: 123
      }
    }

      expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
        /Invalid category type: 'groups' must be an array/
      );
  });

    it('should throw an error when given groups as a null or undefined', () => {
   
    const permsConfig = {
      defaultDenyMessage: "Smily Cat",
      commands: {
        groups: null
      }
    }

      expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
        /Invalid category type: 'groups' must be an array/
      );

      permsConfig.commands.groups = undefined;

            expect(() => Parser.parsePermissionConfig(permsConfig)).toThrow(
        /Invalid category type: 'groups' must be an array/
      );
  });

    it('should successfully parse and return a valid permission config when given valid data', () => {
    
    const permsConfig = {
      defaultDenyMessage: "Smily Cat",
      commands: {
        prefixes: {
          warnUser: {
            rolesOnly: [
              { id: "1221", name: "Moderator" },
            ],
            denyMessage: "Angry Cat with blue eyes"
          }
        },
        slashes: {
                    playMusic: {
            channelsOnly: ["123456"],
            denyMessage: "Smily Cat with a headphone"
          }
        },
        groups: [
          {
            commands: ["addMoney", "reboot"],
            usersOnly: ["123", "456"],
            rolesOnly: [
              { id: "321", name: "Admin Cat" }
            ],
          }, {
            commands: "banUser, kickUser",
            permissionsOnly: "ADMINISTRATOR",
            denyMessage: "Angry Cat"
          }
        ]
      }
    };

        const expected = {
      defaultDenyMessage: "Smily Cat",
      commands: {
        prefixes: {
          warnUser: {
            rolesOnly: ["1221"],
            denyMessage: "Angry Cat with blue eyes"
          }
        },
        slashes: {
                    playMusic: {
            channelsOnly: ["123456"],
            denyMessage: "Smily Cat with a headphone"
          }
        },
        groups: [
          {
            commands: ["addMoney", "reboot"],
            usersOnly: ["123", "456"],
            rolesOnly: ["321"],
          }, {
            commands: ["banUser", "kickUser"],
            permissionsOnly: ["ADMINISTRATOR"],
            denyMessage: "Angry Cat"
          }
        ]
      }
    };

expect(Parser.parsePermissionConfig(permsConfig)).toEqual(expected);
  });

  it('', () => {});
  it('', () => {});

});
