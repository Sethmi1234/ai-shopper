import request from "supertest";
import app from "../src/app";

describe("Authentication Flow", () => {
  test("should register user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Test User",
        email: "test@gmail.com",
        password: "123456"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("user");
  });

  test("should login user", async () => {
    // First register a user
    await request(app)
      .post("/auth/register")
      .send({
        name: "Login Test User",
        email: "logintest@gmail.com",
        password: "123456"
      });

    // Then login
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "logintest@gmail.com",
        password: "123456"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  test("should fail login with wrong password", async () => {
    // First register a user
    await request(app)
      .post("/auth/register")
      .send({
        name: "Wrong Pass User",
        email: "wrongpass@gmail.com",
        password: "123456"
      });

    // Try login with wrong password
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "wrongpass@gmail.com",
        password: "wrongpassword"
      });

    expect(response.statusCode).toBe(401);
  });

  test("should fail login with non-existent user", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "nonexistent@gmail.com",
        password: "123456"
      });

    expect(response.statusCode).toBe(401);
  });
});
