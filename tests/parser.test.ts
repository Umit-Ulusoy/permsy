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
      /Invalid rule: denyMessage must be a string/
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
      /Unknown rule definition/
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