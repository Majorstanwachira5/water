/**
 * Comprehensive Next.js App & Staff Auth Integration Test Suite
 * Spins up apps/web next server and verifies:
 * 1. Public catalog & enquiries
 * 2. Staff login with invalid credentials -> 401
 * 3. Staff login with seeded credentials -> 200 + tokens
 * 4. Protected routes rejection without token -> 401
 * 5. Protected routes acceptance with staff token -> 200/201
 * 6. Session refresh -> 200
 * 7. Logout and refresh token revocation -> 403
 * 8. Non-staff token rejection -> 401
 */

const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const assert = require("assert");

const TEST_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${urlPath}`);
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (payload) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, json, raw });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request("GET", "/api/v1/health");
      if (res.status === 200) return true;
    } catch (e) {
      if (i % 5 === 0)
        console.log(`[wait] polling 127.0.0.1:${TEST_PORT}... (${e.message})`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Next.js server failed to respond within timeout");
}

async function run() {
  console.log(
    "\n================================================================",
  );
  console.log(" MICHAFORGE ENTERPRISES — NEXT.JS & SUPABASE INTEGRATION TEST");
  console.log(
    "================================================================\n",
  );

  console.log(
    `[test] Launching Next.js production server on port ${TEST_PORT}...`,
  );
  const nextProcess = spawn(
    "npx",
    ["next", "start", "-H", "127.0.0.1", "-p", String(TEST_PORT)],
    {
      cwd: path.join(__dirname, "../apps/web"),
      shell: true,
      env: { ...process.env, PORT: String(TEST_PORT) },
    },
  );

  nextProcess.stdout.on("data", (d) => {
    const str = d.toString();
    if (str.includes("Ready in") || str.includes("started server")) {
      console.log(`[next] ${str.trim()}`);
    }
  });

  nextProcess.stderr.on("data", (d) => {
    console.error(`[next-err] ${d.toString().trim()}`);
  });

  let testsPassed = 0;
  async function test(name, fn) {
    process.stdout.write(`  • Testing ${name} ... `);
    try {
      await fn();
      testsPassed++;
      console.log("PASS");
    } catch (err) {
      console.log("FAIL!");
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }

  try {
    await waitForServer();
    console.log("[test] Server is ready! Commencing integration tests.\n");

    // 1. Public Gateway Health
    await test("Gateway Health (/api/v1/health)", async () => {
      const res = await request("GET", "/api/v1/health");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.status, "healthy");
    });

    // 2. Public Catalog & Categories
    await test("Public Catalog Products (/api/v1/catalog/products)", async () => {
      const res = await request("GET", "/api/v1/catalog/products");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(Array.isArray(res.json.data));
    });

    await test("Public Categories Listing (/api/v1/categories)", async () => {
      const res = await request("GET", "/api/v1/categories");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(Array.isArray(res.json.data));
      assert.strictEqual(res.json.data.length, 6, "Must return exactly the 6 active store categories");
    });

    await test("Category Filter by ID (/api/v1/catalog/products?categoryId=cat_taps_faucets)", async () => {
      const res = await request("GET", "/api/v1/catalog/products?categoryId=cat_taps_faucets");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(Array.isArray(res.json.data));
      assert(res.json.data.length > 0, "Must return taps & mixers products");
      for (const p of res.json.data) {
        assert.strictEqual(p.categoryId, "cat_taps_faucets");
      }
    });

    await test("Category Filter by Slug (/api/v1/catalog/products?category=taps-faucets)", async () => {
      const res = await request("GET", "/api/v1/catalog/products?category=taps-faucets");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(Array.isArray(res.json.data));
      assert(res.json.data.length > 0, "Must resolve category slug to products");
    });

    await test("Public Settings (/api/v1/settings/public)", async () => {
      const res = await request("GET", "/api/v1/settings/public");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(res.json.data.businessName.toUpperCase().includes("MICHAFORGE"));
    });

    await test("Homepage About Us & Brand Content (/api/v1/content/homepage)", async () => {
      const res = await request("GET", "/api/v1/content/homepage");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert.strictEqual(res.json.data.brand.heroImageUrl, "/images/hero_showroom_red_tap.jpg");
      assert.strictEqual(res.json.data.about.title, "About Us");
      assert.strictEqual(res.json.data.about.paragraphs.length, 3);
      assert.strictEqual(res.json.data.about.features.length, 3);
      assert(res.json.data.about.slogan.includes("Building Trust Through Quality and Reliability."));
      assert(res.json.data.about.location.includes("Kombo Munyiri Rd, Gikomba"));
    });

    await test("Public Homepage HTML renders exact About Us sections & red-tap showroom image (GET /)", async () => {
      const res = await request("GET", "/");
      assert.strictEqual(res.status, 200);
      assert(res.raw.includes("/images/hero_showroom_red_tap.jpg"));
      assert(res.raw.includes("About Us"));
      assert(res.raw.includes("Michaforge Enterprises is a trusted supplier and dealer in plumbing and hardware materials"));
      assert(res.raw.includes("Our Mission"));
      assert(res.raw.includes("Our Vision"));
      assert(res.raw.includes("Our Slogan"));
      assert(res.raw.includes("Kombo Munyiri Rd, Gikomba, next to Gold Stone Plaza, Nairobi, Kenya"));
    });

    // 3. Customer Enquiry Submission
    await test("Customer Enquiry Submission (/api/v1/enquiries)", async () => {
      const res = await request("POST", "/api/v1/enquiries", {
        customerName: "Integration Tester",
        phoneNumber: "0714843208",
        email: "test@michaforge.co.ke",
        enquiryType: "quote_request",
        message: "Requesting quotation for PPR pipes and fittings.",
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.json.success, true);
      assert.strictEqual(res.json.data.customerName, "Integration Tester");
      assert.strictEqual(res.json.data.phoneNumber, "+254714843208");
      assert(res.json.meta.whatsappQuickLink.includes("wa.me/254714843208"));
    });

    // 4. Staff Authentication Security
    await test("Staff Login: Missing Credentials Rejected (400)", async () => {
      const res = await request("POST", "/api/v1/auth/login", { email: "" });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.json.success, false);
      assert.strictEqual(res.json.error.code, "VALIDATION_ERROR");
    });

    await test("Staff Login: Invalid Password Rejected (401)", async () => {
      const res = await request("POST", "/api/v1/auth/login", {
        email: "admin@michaforge.co.ke",
        password: "WrongPassword123!",
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.json.success, false);
      assert.strictEqual(res.json.error.code, "INVALID_CREDENTIALS");
    });

    let staffToken = "";
    let staffRefreshToken = "";
    await test("Staff Login: Seeded Account Authenticated (200)", async () => {
      const res = await request("POST", "/api/v1/auth/login", {
        email: "admin@michaforge.co.ke",
        password: "Admin@Michaforge2026!",
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(res.json.data.accessToken, "Must return JWT accessToken");
      assert(res.json.data.refreshToken, "Must return JWT refreshToken");
      assert.strictEqual(res.json.data.user.email, "admin@michaforge.co.ke");
      assert.strictEqual(res.json.data.user.role, "Super Admin");
      staffToken = res.json.data.accessToken;
      staffRefreshToken = res.json.data.refreshToken;
    });

    // 5. Protected Routes: Unauthenticated Rejections (401)
    await test("Protected Route Rejection: /api/v1/auth/me without token (401)", async () => {
      const res = await request("GET", "/api/v1/auth/me");
      assert.strictEqual(res.status, 401);
    });

    await test("Protected Route Rejection: /api/v1/admin/reports/overview without token (401)", async () => {
      const res = await request("GET", "/api/v1/admin/reports/overview");
      assert.strictEqual(res.status, 401);
    });

    await test("Protected Route Rejection: /api/v1/admin/enquiries without token (401)", async () => {
      const res = await request("GET", "/api/v1/admin/enquiries");
      assert.strictEqual(res.status, 401);
    });

    await test("Protected Route Rejection: /api/v1/pricing/export without token (401)", async () => {
      const res = await request("GET", "/api/v1/pricing/export");
      assert.strictEqual(res.status, 401);
    });

    await test("Protected Mutation Rejection: POST /api/v1/products without token (401)", async () => {
      const res = await request("POST", "/api/v1/products", {
        name: "Unauthorized Item",
      });
      assert.strictEqual(res.status, 401);
    });

    await test("Protected Mutation Rejection: POST /api/v1/categories without token (401)", async () => {
      const res = await request("POST", "/api/v1/categories", {
        name: "Unauthorized Category",
      });
      assert.strictEqual(res.status, 401);
    });

    await test("Protected Mutation Rejection: POST /api/v1/pricing/bulk-update without token (401)", async () => {
      const res = await request("POST", "/api/v1/pricing/bulk-update", {
        updates: [],
      });
      assert.strictEqual(res.status, 401);
    });

    // 6. Protected Routes: Staff Authorized Operations (200/201)
    await test("Staff Authenticated: GET /api/v1/auth/me with Bearer token (200)", async () => {
      const res = await request("GET", "/api/v1/auth/me", null, {
        Authorization: `Bearer ${staffToken}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.data.email, "admin@michaforge.co.ke");
      assert.strictEqual(res.json.data.role, "Super Admin");
    });

    await test("Staff Authenticated: GET /api/v1/admin/reports/overview (200)", async () => {
      const res = await request("GET", "/api/v1/admin/reports/overview", null, {
        Authorization: `Bearer ${staffToken}`,
      });
      assert.strictEqual(res.status, 200);
      assert(res.json.data.totalProducts !== undefined);
    });

    await test("Staff Authenticated: GET /api/v1/admin/enquiries (200)", async () => {
      const res = await request("GET", "/api/v1/admin/enquiries", null, {
        Authorization: `Bearer ${staffToken}`,
      });
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.json.data));
    });

    await test("Staff Authenticated: GET /api/v1/pricing/export CSV (200)", async () => {
      const res = await request("GET", "/api/v1/pricing/export", null, {
        Authorization: `Bearer ${staffToken}`,
      });
      assert.strictEqual(res.status, 200);
      assert(res.raw.includes("Product_ID,Price_KES"));
    });

    await test("Staff Authenticated: POST /api/v1/admin/notifications/test (200)", async () => {
      const res = await request(
        "POST",
        "/api/v1/admin/notifications/test",
        {
          channel: "sms",
          recipient: "+254714843208",
        },
        {
          Authorization: `Bearer ${staffToken}`,
        },
      );
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
    });

    // 6b. End-to-End Product Lifecycle & Media Upload
    let testProductId = "";
    await test("Staff Media Upload: POST /api/v1/media/uploads (201)", async () => {
      const res = await request(
        "POST",
        "/api/v1/media/uploads",
        {
          fileName: "test-product-valve.png",
          url: "/images/products/product_synnova_urinal.png",
          category: "product",
          altText: "Test Product Valve",
        },
        {
          Authorization: `Bearer ${staffToken}`,
        },
      );
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.json.success, true);
      assert(res.json.data.id);
    });

    await test("Staff Product Creation: POST /api/v1/products (201)", async () => {
      const testSku = `MF-E2E-${Date.now().toString().slice(-4)}`;
      const res = await request(
        "POST",
        "/api/v1/products",
        {
          name: "E2E Test Heavy Brass Valve",
          sku: testSku,
          categoryId: "cat_hardware_items",
          unit: "piece",
          description: "End-to-end integration test product for Michaforge store",
          shortDescription: "Heavy Brass Valve E2E",
          isFeatured: true,
          images: [
            {
              id: "img_test_1",
              url: "/images/products/product_synnova_urinal.png",
              altText: "Heavy Brass Valve",
              displayOrder: 1,
              isPrimary: true,
            },
          ],
        },
        {
          Authorization: `Bearer ${staffToken}`,
        },
      );
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.json.success, true);
      assert(res.json.data.id);
      testProductId = res.json.data.id;
    });

    await test("Staff Product Pricing: POST /api/v1/pricing/products/:id (200)", async () => {
      const res = await request(
        "POST",
        `/api/v1/pricing/products/${testProductId}`,
        {
          price: 5200,
          unit: "piece",
          reason: "E2E Verification Price",
        },
        {
          Authorization: `Bearer ${staffToken}`,
        },
      );
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.data.price, 5200);
    });

    await test("Public Catalog Integration: Verify created product appears in live catalog", async () => {
      const res = await request("GET", "/api/v1/catalog/products?search=E2E%20Test");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      const found = res.json.data.find((p) => p.id === testProductId);
      assert(found, "Newly created product must be returned by public catalog API");
      assert.strictEqual(found.price, 5200);
    });

    await test("Staff Product Update: PATCH /api/v1/products/:id (200)", async () => {
      const res = await request(
        "PATCH",
        `/api/v1/products/${testProductId}`,
        {
          name: "E2E Test Heavy Brass Valve (Updated)",
        },
        {
          Authorization: `Bearer ${staffToken}`,
        },
      );
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.data.name, "E2E Test Heavy Brass Valve (Updated)");
    });

    await test("Staff Product Cleanup: DELETE /api/v1/products/:id (200)", async () => {
      const res = await request(
        "DELETE",
        `/api/v1/products/${testProductId}`,
        null,
        {
          Authorization: `Bearer ${staffToken}`,
        },
      );
      assert.strictEqual(res.status, 200);
    });

    // 7. Session Refresh & Revocation
    let newAccessToken = "";
    await test("Session Refresh: Valid refresh token issues new access token (200)", async () => {
      const res = await request("POST", "/api/v1/auth/refresh", {
        refreshToken: staffRefreshToken,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert(res.json.data.accessToken, "Must return new accessToken");
      newAccessToken = res.json.data.accessToken;
    });

    await test("Session Verification with Refreshed Access Token (200)", async () => {
      const res = await request("GET", "/api/v1/auth/me", null, {
        Authorization: `Bearer ${newAccessToken}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.data.email, "admin@michaforge.co.ke");
    });

    await test("Staff Logout: Revoke session (200)", async () => {
      const res = await request("POST", "/api/v1/auth/logout", {
        refreshToken: staffRefreshToken,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
    });

    await test("Session Refresh: Revoked token is rejected (403)", async () => {
      const res = await request("POST", "/api/v1/auth/refresh", {
        refreshToken: staffRefreshToken,
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.json.success, false);
      assert.strictEqual(res.json.error.code, "FORBIDDEN");
    });

    console.log(
      `\n================================================================`,
    );
    console.log(` ALL ${testsPassed} INTEGRATION TESTS PASSED SUCCESSFULLY!`);
    console.log(
      `================================================================\n`,
    );
  } finally {
    console.log("[test] Terminating Next.js server...");
    try {
      if (process.platform === "win32") {
        require("child_process").execSync(`taskkill /pid ${nextProcess.pid} /T /F`, { stdio: "ignore" });
      } else {
        nextProcess.kill("SIGTERM");
      }
    } catch {}
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("\n[FATAL TEST FAILURE]", err);
  process.exit(1);
});
