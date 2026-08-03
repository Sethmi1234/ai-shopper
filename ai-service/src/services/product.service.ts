export class ProductService {
  async getProducts(query: any = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    }
    const qs = params.toString();
    const res = await fetch("http://localhost:5002/products?${qs}");
    if (!res.ok) {
        throw new Error("Failed to fetch products from product-service");
    }
    return res.json();
  }
}
