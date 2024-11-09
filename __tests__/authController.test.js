const { login } = require("../controllers/authController.js");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

jest.mock("../models/user.js");
jest.mock("jsonwebtoken");

describe("AuthController - login", () => {
  const secretForToken = "secret word";

  beforeAll(() => {
    process.env.TOKEN_SECRET = secretForToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a token and user for valid credentials", async () => {
    const email = "test@example.com";
    const password = "validPassword";
    const userId = "userId123";
    const token = "testToken";

    const userMock = {
      _id: userId,
      email: email,
      subscription: "starter",
      validPassword: jest.fn().mockReturnValue(true),
      save: jest.fn(),
    };

    User.findOne.mockResolvedValue(userMock);
    jwt.sign.mockReturnValue(token);

    const data = { email, password };

    const result = await login(data);

    expect(result).toHaveProperty("token");
    expect(result.token).toBe(token);

    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe(email);
    expect(result.user.subscription).toBe("starter");

    expect(User.findOne).toHaveBeenCalledWith({ email: email, verify: true });
    expect(userMock.validPassword).toHaveBeenCalledWith(password);
    expect(jwt.sign).toHaveBeenCalledWith({ userId: userId }, secretForToken, {
      expiresIn: "1h",
    });
    expect(userMock.save).toHaveBeenCalled();
  });

  it("should throw an error if email is not provided", async () => {
    const data = { password: "validPassword" };

    await expect(login(data)).rejects.toThrow(
      "Email and password are required"
    );
  });

  it("should throw an error if password is not provided", async () => {
    const data = { email: "test@example.com" };

    await expect(login(data)).rejects.toThrow(
      "Email and password are required"
    );
  });

  it("should throw an error if user is not found", async () => {
    const email = "test@example.com";
    const password = "validPassword";

    User.findOne.mockResolvedValue(null);

    const data = { email, password };

    await expect(login(data)).rejects.toThrow("Email or password is wrong");

    expect(User.findOne).toHaveBeenCalledWith({ email: email, verify: true });
  });

  it("should throw an error if password is incorrect", async () => {
    const email = "test@example.com";
    const password = "wrongPassword";

    const userMock = {
      validPassword: jest.fn().mockReturnValue(false),
    };

    User.findOne.mockResolvedValue(userMock);

    const data = { email, password };

    await expect(login(data)).rejects.toThrow("Email or password is wrong");

    expect(User.findOne).toHaveBeenCalledWith({ email: email, verify: true });
    expect(userMock.validPassword).toHaveBeenCalledWith(password);
  });
});
