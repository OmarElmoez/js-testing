import { describe, it, expect, vi, afterEach, restoreAllMocks } from "vitest";
import {
  getDiscount,
  getPriceInCurrency,
  getShippingInfo,
  isOnline,
  login,
  renderPage,
  signUp,
  submitOrder,
} from "../src/mocking";
import { getExchangeRate } from "../src/libs/currency";
import { getShippingQuote } from "../src/libs/shipping";
import { trackPageView } from "../src/libs/analytics";
import { charge } from "../src/libs/payment";
import { sendEmail } from "../src/libs/email";
import security from "../src/libs/security";

vi.mock("../src/libs/currency");
vi.mock("../src/libs/shipping");
vi.mock("../src/libs/analytics");
vi.mock("../src/libs/payment");
vi.mock("../src/libs/email", async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    sendEmail: vi.fn(),
  };
});

describe("mock function", () => {
  it("first mock function", () => {
    const sendText = vi.fn();
    sendText.mockImplementation((msg) => msg);

    const result = sendText("OK");

    expect(sendText).toHaveBeenCalled();
    expect(result).toBe("OK");
  });
});

describe("getPriceInCurrency", () => {
  it("should return the price in the target currency", () => {
    vi.mocked(getExchangeRate).mockReturnValue(1.5);

    const price = getPriceInCurrency(10, "AUD");

    expect(price).toBe(15);
  });
});

describe("getShippingInfo", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the shipping info", () => {
    vi.mocked(getShippingQuote).mockReturnValue({ cost: 10, estimatedDays: 2 });

    const result = getShippingInfo("egypt");

    expect(result).toMatch("$10");
    expect(result).toMatch(/2 days/i);
  });

  // if you this unit as the first unit, there will be no need to restore all mocks
  it("should return error msg if no quote", () => {
    // we don't need to program the mocked function
    // since it will be undefined by default;
    const result = getShippingInfo("egypt");

    expect(result).toMatch(/available/i);
  });
});

describe("renderPage", () => {
  it("should return correct content", async () => {
    const result = await renderPage();

    expect(result).toMatch(/content/i);
  });

  it("should call analytics", async () => {
    await renderPage();

    expect(trackPageView).toBeCalledWith("/home");
  });
});

describe("submitOrder", () => {
  const order = {
    totalAmount: 10,
  };

  const creditCard = {
    creditCardNumber: 1234,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call payment", async () => {
    vi.mocked(charge).mockResolvedValue({});

    await submitOrder(order, creditCard);

    expect(charge).toBeCalledWith(creditCard, order.totalAmount);
  });

  it("should reutrn true if payment is success", async () => {
    vi.mocked(charge).mockReturnValue({ status: "success" });

    const result = await submitOrder(order, creditCard);

    // expect(result).toHaveProperty('success');
    // expect(typeof result.success).toBe('boolean');
    // expect(result.success).toBe(true);

    expect(result).toEqual({ success: true });
  });

  it("should reutrn false if payment is failed", async () => {
    vi.mocked(charge).mockReturnValue({ status: "failed" });

    const result = await submitOrder(order, creditCard);

    expect(result).toMatchObject({ success: false });

    // expect(result).toHaveProperty('success');
    expect(result).toHaveProperty("error");
    // expect(typeof result.success).toBe('boolean');
    expect(typeof result.error).toBe("string");
    // expect(result.success).toBe(false);
    expect(result.error).toMatch(/error/i);

    // expect(result).toEqual({success: false, error: 'payment_error'})
  });
});

describe("signUp", () => {
  const validEmail = "omar@gmail.com";

  it("should return false for unvalid email", async () => {
    const result = await signUp("o");

    expect(result).toBe(false);
  });

  it("should return true for valid email", async () => {
    const result = await signUp(validEmail);

    expect(result).toBe(true);
  });

  it("should send email for valid email", async () => {
    await signUp(validEmail);

    expect(sendEmail).toHaveBeenCalledOnce();
    // we can't use toBeCalledWith() and pass args
    // becaues we can't use regx for the second argument, and we will find
    // ourselfes write tight assertions.

    const args = vi.mocked(sendEmail).mock.calls[0];
    expect(args[0]).toBe(validEmail);
    expect(args[1]).toMatch(/welcome/i);
  });
});

describe("login", () => {
  it("should email the one-time code", async () => {
    const email = "omar@gmail.com";
    const spy = vi.spyOn(security, "generateCode");
    await login(email);

    const code = spy.mock.results[0].value.toString();
    expect(sendEmail).toBeCalledWith(email, code);
  });
});

describe("isOnline", () => {
  it("should return false if current hour is out of range", () => {
    vi.setSystemTime("2025-7-19 07:59");
    expect(isOnline()).toBe(false);

    vi.setSystemTime("2025-7-19 20:01");
    expect(isOnline()).toBe(false);
  });

  it("should return true if current hour is in range", () => {
    vi.setSystemTime("2025-7-19 08:00");
    expect(isOnline()).toBe(true);

    vi.setSystemTime("2025-7-19 19:59");
    expect(isOnline()).toBe(true);
  });
});

describe("getDiscount", () => {
  it("should should return 0.2 on christmas day", () => {
    vi.setSystemTime("2025-12-25");
    expect(getDiscount()).toBe(0.2);
  });

  it("should should return 0 on regular days", () => {
    vi.setSystemTime("2025-12-24");
    expect(getDiscount()).toBe(0);
  });
});
