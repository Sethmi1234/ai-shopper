import request from "supertest";
import app from "../src/app";

async function getAuthToken() {
  const timestamp = Date.now();
  const email = `carttest${timestamp}@gmail.com`;
  
  // Register a user
  await request(app)
    .post("/auth/register")
    .send({
      name: "Cart Test User",
      email: email,
      password: "123456"
    });

  // Login to get token
  const login = await request(app)
    .post("/auth/login")
    .send({
      email: email,
      password: "123456"
    });

  return login.body.accessToken;
}

describe("Cart Flow", () => {
  test("should add product to cart", async () => {
    const token = await getAuthToken();
    
    const response = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: "1",
        title: "Test Product",
        price: 100,
        quantity: 2,
        thumbnail: "test.jpg"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  test("should get cart", async () => {
    const token = await getAuthToken();
    
    const response = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("items");
  });

  test("should remove item from cart", async () => {
    const token = await getAuthToken();
    
    // First add an item
    const addResponse = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: "1",
        title: "Test Product",
        price: 100,
        quantity: 2,
        thumbnail: "test.jpg"
      });

    // Get the actual item ID from the response
    const itemId = addResponse.body.items[0]._id;

    // Then remove it using the actual ID
    const response = await request(app)
      .delete(`/cart/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });

  test("should fail cart operation without token", async () => {
    const response = await request(app)
      .get("/cart");

    expect(response.statusCode).toBe(401);
  });
});
