import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyPostgres from "@fastify/postgres";
import fetch from "node-fetch";

const fastify = Fastify();

fastify.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
});

fastify.register(fastifyPostgres, {
  connectionString: "postgres://postgres:Aryani123@localhost:5432/mydatabase",
});

type Product = {
  id: string;
  title: string;
  sku: string;
  images: string;
  price: number;
  description: string;
  stock: number;
};

// Endpoint untuk seed data dummy ke database
fastify.post("/seed/products", async (request, reply) => {
  const res = await fetch("https://dummyjson.com/products");
  const data: any = await res.json();
  const products: Product[] = data.products;

  for (const product of products) {
    let images = product.images;

    if (Array.isArray(images) && images.length > 0) {
      images = product.images[0];
    }

    await fastify.pg.query(
      "INSERT INTO product(title, sku, image, price, description, stock) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING",
      [
        product.title,
        product.sku,
        images,
        product.price,
        product.description,
        product.stock,
      ]
    );
  }
  return { status: "ok", inserted: products.length };
});

fastify.post("/product", async (request, reply) => {
  const { title, sku, image, price, stock, description } = request.body as {
    title: string;
    sku: string;
    image?: string;
    price: number;
    stock?: number;
    description?: string;
  };

  if (!title || !sku || price == null) {
    return reply.status(400).send({
      status: "error",
      message: "Title, SKU, dan Price wajib diisi",
      data: null,
    });
  }

  try {
    const result = await fastify.pg.query(
      `INSERT INTO product (title, sku, image, price, stock, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, sku, image, price, stock, description`,
      [title, sku, image || null, price, stock || 0, description || ""]
    );
    return {
      status: "success",
      data: result.rows[0],
    };
  } catch (err: any) {
    if (err.code === "23505") {
      return reply.status(400).send({
        status: "error",
        message: "SKU sudah terdaftar",
        data: null,
      });
    }
    return reply.status(500).send({
      status: "error",
      message: err.message,
      data: null,
    });
  }
});

fastify.get("/product/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await fastify.pg.query(
    "SELECT id, title, sku, image, price, description, stock FROM product WHERE id = $1",
    [id]
  );
  if (result.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Product not found",
      data: null,
    });
  }
  return {
    status: "success",
    data: result.rows[0],
  };
});

fastify.put("/product/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const { title, sku, images, price, description, stock } =
    request.body as Product;
  const exists = await fastify.pg.query(
    "SELECT id FROM product WHERE id = $1",
    [id]
  );
  if (exists.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Product not found",
      data: null,
    });
  }
  const result = await fastify.pg.query(
    "UPDATE product SET title=$1, sku=$2, image=$3, price=$4, stock=$5, description=$6 WHERE id=$7 RETURNING *",
    [title, sku, images || null, price, stock || 0, description || "", id]
  );
  return {
    status: "success",
    data: result.rows[0],
  };
});

fastify.delete("/product/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await fastify.pg.query(
    "DELETE FROM product WHERE id = $1 RETURNING id",
    [id]
  );
  if (result.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Product not found",
      data: null,
    });
  }
  // Berhasil hapus
  return {
    status: "success",
    data: { id: Number(id) },
  };
});

// Endpoint get semua products
fastify.get("/list-products", async (req, reply) => {
  const result = await fastify.pg.query("SELECT * FROM product");
  return result.rows;
});

fastify.post("/product/:sku/adjustment", async (request, reply) => {
  const { sku } = request.params as { sku: string };
  const { qty, price } = request.body as { qty: number; price: number };

  if (!qty || qty === 0) {
    return reply.status(400).send({
      status: "error",
      message: "Qty tidak boleh nol",
      data: null,
    });
  }

  // Transaksi: tambah adjustment dan update stock product
  const client = await fastify.pg.connect();
  try {
    await client.query("BEGIN");
    // Update stock product
    const prodRes = await client.query(
      "UPDATE product SET stock = stock + $1 WHERE sku = $2 RETURNING *",
      [qty, sku]
    );
    if (prodRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return reply.status(404).send({
        status: "error",
        message: "Produk tidak ditemukan",
        data: null,
      });
    }
    // Insert ke adjustment_transaction
    const adjustRes = await client.query(
      "INSERT INTO adjustment_transaction (sku, qty, price) VALUES ($1, $2, $3) RETURNING *",
      [sku, qty, price]
    );
    await client.query("COMMIT");
    return {
      status: "success",
      data: {
        product: prodRes.rows[0],
        adjustment: adjustRes.rows[0],
      },
    };
  } catch (e: any) {
    await client.query("ROLLBACK");
    return reply.status(500).send({
      status: "error",
      // message: "Transaksi gagal",
      message: e.message,
      data: null,
    });
  } finally {
    client.release();
  }
});

fastify.get("/product/:sku/adjustments", async (request, reply) => {
  const { sku } = request.params as { sku: string };
  const res = await fastify.pg.query(
    "SELECT * FROM adjustment_transaction WHERE sku = $1 ORDER BY created_at DESC",
    [sku]
  );
  return {
    status: "success",
    data: res.rows,
  };
});

fastify.get("/product/sku/:sku", async (request, reply) => {
  const { sku } = request.params as { sku: string };

  // Query produk by sku
  const result = await fastify.pg.query(
    "SELECT id, sku, title, price, stock, image FROM product WHERE sku = $1",
    [sku]
  );

  if (result.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Produk tidak ditemukan",
      data: null,
    });
  }

  return {
    status: "success",
    data: result.rows[0],
  };
});

fastify.get("/adjustments", async (request, reply) => {
  const res = await fastify.pg.query(
    "SELECT id, sku, qty, created_at, price FROM adjustment_transaction ORDER BY created_at DESC"
  );
  return {
    status: "success",
    data: res.rows,
  };
});

// Untuk GET /adjustment/:id (agar form edit di atas bisa prefill)
fastify.get("/adjustment/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await fastify.pg.query(
    "SELECT id, sku, qty, price, created_at FROM adjustment_transaction WHERE id = $1",
    [id]
  );
  if (result.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Adjustment tidak ditemukan",
      data: null,
    });
  }
  return {
    status: "success",
    data: result.rows[0],
  };
});

fastify.put("/adjustment/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const { qty } = request.body as { qty: number };

  if (qty === undefined || Number(qty) === 0) {
    return reply.status(400).send({
      status: "error",
      message: "Qty wajib diisi dan tidak nol!",
      data: null,
    });
  }

  // Cari SKU dari adjustment yang akan diubah
  const curr = await fastify.pg.query(
    "SELECT sku FROM adjustment_transaction WHERE id = $1",
    [id]
  );
  if (curr.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Adjustment tidak ditemukan",
      data: null,
    });
  }
  const sku = curr.rows[0].sku;

  // Ambil price dulu dari produk
  const prod = await fastify.pg.query(
    "SELECT price FROM product WHERE sku = $1",
    [sku]
  );
  if (prod.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Produk tidak ditemukan",
      data: null,
    });
  }
  const price = prod.rows[0].price;

  // Lakukan update qty & price pada adjustment
  const result = await fastify.pg.query(
    `UPDATE adjustment_transaction 
     SET qty=$1, price=$2
     WHERE id=$3
     RETURNING id, sku, qty, price, created_at`,
    [qty, price, id]
  );

  return {
    status: "success",
    data: result.rows[0],
  };
});

fastify.delete("/adjustment/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await fastify.pg.query(
    "DELETE FROM adjustment_transaction WHERE id = $1 RETURNING id",
    [id]
  );
  if (result.rowCount === 0) {
    return reply.status(404).send({
      status: "error",
      message: "Adjustment tidak ditemukan",
      data: null,
    });
  }
  return {
    status: "success",
    data: { id: Number(id) },
  };
});

// POST /order
fastify.post("/order", async (request, reply) => {
  const { cart } = request.body as {
    cart: {
      product_id: number;
      sku: string;
      qty: number;
      price: number;
    }[];
  };

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return reply.status(400).send({
      status: "error",
      message: "Cart kosong",
      data: null,
    });
  }

  const client = await fastify.pg.connect();
  try {
    await client.query("BEGIN");
    // Insert order
    const orderRes = await client.query(
      "INSERT INTO orders DEFAULT VALUES RETURNING id, created_at"
    );
    const orderId = orderRes.rows[0].id;

    // Insert order items
    for (const item of cart) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, sku, qty, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.sku, item.qty, item.price]
      );

      await client.query(
        `INSERT INTO adjustment_transaction (sku, qty, price)
         VALUES ($1, $2, $3)`,
        [item.sku, item.qty, item.price]
      );

      // (Optional: update stock product)
      await client.query(
        "UPDATE product SET stock = stock - $1 WHERE id = $2",
        [item.qty, item.product_id]
      );
    }
    await client.query("COMMIT");
    return {
      status: "success",
      data: { order_id: orderId },
    };
  } catch (err: any) {
    await client.query("ROLLBACK");
    return (
      reply
        .status(500)
        // .send({ status: "error", message: "Gagal menyimpan order", data: null });
        .send({ status: "error", message: err.message, data: null })
    );
  } finally {
    client.release();
  }
});

// // Allow CORS for local testing
// fastify.addHook("onSend", (request, reply, payload, done) => {
//   reply.header("Access-Control-Allow-Origin", "*");
//   done();
// });

fastify.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});
