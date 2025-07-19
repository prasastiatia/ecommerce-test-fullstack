import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

type Product = {
  id: number;
  title: string;
  sku: string;
  image?: string;
  price: number;
  stock: number;
  description?: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState<Omit<Product, "id">>({
    title: "",
    sku: "",
    image: "",
    price: 0,
    stock: 0,
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get existing product data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get<{ status: string; data: Product }>(
        `http://localhost:3001/product/${id}`
      )
      .then((res) => {
        if (res.data.status === "success") {
          setForm({
            title: res.data.data.title,
            sku: res.data.data.sku,
            image: res.data.data.image ?? "",
            price: res.data.data.price,
            stock: res.data.data.stock ?? 0,
            description: res.data.data.description ?? "",
          });
        } else {
          setError("Produk tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal mengambil data produk"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.sku || String(form.price) === "") {
      setError("Title, SKU, dan Price wajib diisi!");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await axios.put(`http://localhost:3001/product/${id}`, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      if (res.data.status === "success") {
        router.push(`/product/${id}`);
      } else {
        setError(res.data.message || "Gagal mengupdate produk");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengupdate produk");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        Memuat data produk...
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 40, textAlign: "center", color: "red" }}>
        {error}
        <br />
        <Link href="/">Kembali ke Daftar Produk</Link>
      </main>
    );
  }

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
        <Link href={`/product/${id}`} style={{ color: "#1976D2" }}>
          ← Kembali ke Detail Produk
        </Link>
        <h1
          style={{
            marginTop: 18,
            marginBottom: 20,
            fontSize: 25,
            fontWeight: 700,
          }}
        >
          Edit Produk
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
            type="number"
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
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </main>
  );
}
