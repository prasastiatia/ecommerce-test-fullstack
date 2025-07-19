import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    sku: "",
    image: "",
    price: "",
    stock: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.title || !form.sku || !form.price) {
      setError("Title, SKU, dan Price wajib diisi!");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/product", {
        title: form.title,
        sku: form.sku,
        image:
          form.image && form.image.trim() !== ""
            ? form.image
            : `https://source.unsplash.com/featured/250x180?product,${encodeURIComponent(
                form.title
              )}`,
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : 0,
        description: form.description,
      });

      if (res.data.status === "success") {
        router.push("/"); // redirect ke halaman utama/produk setelah sukses
      } else {
        setError(res.data.message || "Gagal menambah produk");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambah produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        fontFamily: "sans-serif",
        padding: "52px 0",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 6px 26px #0001",
          padding: 36,
        }}
      >
        <Link href="/" style={{ color: "#1976D2" }}>
          ← Kembali ke Daftar Produk
        </Link>
        <h1
          style={{
            marginTop: 18,
            marginBottom: 20,
            fontSize: 25,
            fontWeight: 700,
          }}
        >
          Tambah Produk Baru
        </h1>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <input
            name="title"
            placeholder="Nama Produk"
            value={form.title}
            onChange={handleChange}
            style={{ padding: 11, borderRadius: 7, border: "1px solid #ccc" }}
            required
          />
          <input
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
            style={{ padding: 11, borderRadius: 7, border: "1px solid #ccc" }}
            required
          />
          <input
            name="image"
            placeholder="URL Gambar (opsional)"
            value={form.image}
            onChange={handleChange}
            style={{ padding: 11, borderRadius: 7, border: "1px solid #ccc" }}
          />
          <input
            name="price"
            placeholder="Harga"
            value={form.price}
            onChange={handleChange}
            style={{ padding: 11, borderRadius: 7, border: "1px solid #ccc" }}
            required
          />
          <input
            name="stock"
            placeholder="Stok"
            type="number"
            value={form.stock}
            onChange={handleChange}
            style={{ padding: 11, borderRadius: 7, border: "1px solid #ccc" }}
          />
          <textarea
            name="description"
            placeholder="Deskripsi produk"
            value={form.description}
            onChange={handleChange}
            style={{
              padding: 11,
              borderRadius: 7,
              border: "1px solid #ccc",
              minHeight: 70,
            }}
          />
          {error && (
            <div style={{ color: "#d00", fontSize: 14, marginTop: -8 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "12px 20px",
              background: "#1976D2",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </div>
    </main>
  );
}
