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