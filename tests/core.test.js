import { describe, it, expect, beforeEach } from 'vitest';
import {
  canDrive,
  failedFetchData,
  fetchData,
  getCoupons,
  isPriceInRange,
  isValidUsername,
  Stack,
  validateUserInput,
} from '../src/core';

describe('getCoupons', () => {
  it('should return an array of coupons', () => {
    const result = getCoupons();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return an array of coupons with valid codes', () => {
    const result = getCoupons();
    // better than for loop.
    result.forEach((coupon) => {
      expect(coupon).toHaveProperty('code');
      expect(typeof coupon.code).toBe('string');
      expect(coupon.code).toBeTruthy();
    });
  });

  it('should return an array of coupons with valid discounts', () => {
    const result = getCoupons();
    result.forEach((coupon) => {
      expect(coupon).toHaveProperty('code');
      expect(typeof coupon.discount).toBe('number');
      expect(coupon.discount).toBeGreaterThan(0);
      expect(coupon.discount).toBeLessThan(1);
    });
  });
});

// when we have conditions in our function, it is better to set them up in the name
// of the test

describe('validateUserInput', () => {
  it('should return a successful message when given valid inputs', () => {
    expect(validateUserInput('omar', 25)).toMatch(/success/i);
  });

  // it('should return an error message when given invalid username', () => {
  //   expect(validateUserInput(10, 25)).toMatch(/invalid/i);
  //   expect(validateUserInput("om", 25)).toMatch(/invalid/i);
  // })

  it('should return an error message if username is not a string', () => {
    expect(validateUserInput(10, 25)).toMatch(/invalid/i);
  });

  it('should return an error message if username is less than 3 characters', () => {
    expect(validateUserInput('om', 25)).toMatch(/invalid/i);
  });

  it('should return an error message if username is longer than 255 characters', () => {
    expect(validateUserInput('o'.repeat(256), 25)).toMatch(/invalid/i);
  });

  // it('should return an error message when given invalid age', () => {
  //   expect(validateUserInput('omar', "25")).toMatch(/invalid/i);
  //   expect(validateUserInput("omar", 15)).toMatch(/invalid/i);
  // })

  it('should return an error message if age is not a number', () => {
    expect(validateUserInput('omar', '25')).toMatch(/invalid/i);
  });

  it('should return an error message if age is less than 18', () => {
    expect(validateUserInput('omar', 15)).toMatch(/invalid/i);
  });

  it('should return an error message if age is over than 100', () => {
    expect(validateUserInput('omar', 115)).toMatch(/invalid/i);
  });

  it('should return an error message when given invalid inputs', () => {
    expect(validateUserInput('', 0)).toMatch(/invalid username/i);
    expect(validateUserInput('', 0)).toMatch(/invalid age/i);
  });
});

describe('isValidUsername', () => {
  const minLength = 5;
  const maxLength = 15;

  it('should return false if username is too long', () => {
    expect(isValidUsername('o'.repeat(maxLength + 1))).toBe(false);
  });

  it('should return false if username is too short', () => {
    expect(isValidUsername('o'.repeat(minLength - 1))).toBe(false);
  });

  it('should return true if username at the min or max length', () => {
    expect(isValidUsername('o'.repeat(minLength))).toBe(true);
    expect(isValidUsername('o'.repeat(maxLength))).toBe(true);
  });

  it('should return true if username is in the range', () => {
    expect(isValidUsername('o'.repeat(maxLength - 1))).toBe(true);
    expect(isValidUsername('o'.repeat(minLength + 1))).toBe(true);
  });

  it('should return false for invalid inputs types', () => {
    expect(isValidUsername(null)).toBe(false);
    expect(isValidUsername(undefined)).toBe(false);
    expect(isValidUsername(2)).toBe(false);
  });
});

describe('canDrive', () => {
  // Valid Country Codes => US, UK
  const LegalAgeForUS = 16;
  const LegalAgeForUK = 17;

  it('should return an error message for invalid county code', () => {
    expect(canDrive(10, 'EG')).toMatch(/invalid/i);
  });

  it('should return false for underage in the US', () => {
    expect(canDrive(LegalAgeForUS - 1, 'US')).toBe(false);
  });

  it('should return true for eligible in the US', () => {
    expect(canDrive(LegalAgeForUS + 1, 'US')).toBe(true);
    expect(canDrive(LegalAgeForUS, 'US')).toBe(true);
  });

  it('should return false for underage in the UK', () => {
    expect(canDrive(LegalAgeForUK - 1, 'UK')).toBe(false);
  });

  it('should return true for eligible in the UK', () => {
    expect(canDrive(LegalAgeForUK + 1, 'UK')).toBe(true);
    expect(canDrive(LegalAgeForUK, 'UK')).toBe(true);
  });

  // this (up code) approach (using constants for ages) is not the best since if we increase countries in prod code
  // we will need to repeat all of that in the test.

  // the chances for changing the ages are few, so there is no harm to hard coding them

  it('should return false for underage in the US', () => {
    expect(canDrive(15, 'US')).toBe(false);
  });

  it('should return true for min age in the US', () => {
    expect(canDrive(16, 'US')).toBe(true);
  });

  it('should return true for min ageeligible in the US', () => {
    expect(canDrive(17, 'US')).toBe(true);
  });

  it('should return false for underage in the UK', () => {
    expect(canDrive(16, 'UK')).toBe(false);
  });

  it('should return true for min age in the UK', () => {
    expect(canDrive(17, 'UK')).toBe(true);
  });

  it('should return true for min ageeligible in the UK', () => {
    expect(canDrive(18, 'UK')).toBe(true);
  });

  // we use the same logic, but with different data.
  // consider using Parameterized tests

  it.each([
    { age: 15, country: 'US', result: false },
    { age: 16, country: 'US', result: true },
    { age: 17, country: 'US', result: true },
    { age: 16, country: 'UK', result: false },
    { age: 17, country: 'UK', result: true },
    { age: 18, country: 'UK', result: true },
  ])(
    'should return $result for ($age, $country)',
    ({ age, country, result }) => {
      expect(canDrive(age, country)).toBe(result);
    },
  );
});

describe('isPriceInRange', () => {
  const min = 0;
  const max = 100;

  it.each([
    { price: -10, result: false },
    { price: 200, result: false },
    { price: min, result: true },
    { price: max, result: true },
    { price: 50, result: true },
  ])('should return $result for ($price)', ({ price, result }) => {
    expect(isPriceInRange(price, min, max)).toBe(result);
  });
});

describe('fetchData', () => {
  it('should return a promise resolves to an array of numbers', async () => {
    const result = await fetchData();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('failedFetchData', () => {
  it('should return a rejected promise with a reason', async () => {
    try {
      await failedFetchData();
    } catch (error) {
      expect(error).toHaveProperty('reason');
      expect(error.reason).toMatch(/fail/i);
    }
  });
});

describe('Stack', () => {
  let stack;
  beforeEach(() => {
    stack = new Stack();
  });

  it('push should add an item to the stack', () => {
    stack.push(1);

    expect(stack.size()).toBe(1);
  });

  it('pop should return and remove the top item of the stack', () => {
    stack.push(1);
    stack.push(2);

    const poppedItem = stack.pop();

    expect(poppedItem).toBe(2);
    expect(stack.size()).toBe(1);
  });

  it('pop should throw an error if stack is empty', () => {
    // don't forget the callback function in expect to catch the error
    expect(() => stack.pop()).toThrowError(/empty/i);
  });

  it('peek should return the top item of the stack without removing it', () => {
    stack.push(1);
    stack.push(2);

    const topItem = stack.peek();

    expect(topItem).toBe(2);
    expect(stack.size()).toBe(2);
  });

  it('peek should throw an error is stack is empty', () => {
    expect(() => stack.peek()).toThrowError(/empty/i);
  });

  it('isEmpty should return true if stack is empty', () => {
    expect(stack.isEmpty()).toBe(true);
  });

  it('isEmpty should return false if stack is not empty', () => {
    stack.push(1);

    expect(stack.isEmpty()).toBe(false);
  });

  it('size should return the number of itmes in the stack', () => {
    stack.push(1);
    stack.push(2);

    expect(stack.size()).toBe(2);
  });

  it('clear should remove all items from the stack', () => {
    stack.push(1);
    stack.push(2);

    stack.clear();

    expect(stack.size()).toBe(0);
  });
});
