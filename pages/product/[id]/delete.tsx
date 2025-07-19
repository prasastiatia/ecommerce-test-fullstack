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

export default function DeleteProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get<{ status: string; data: Product }>(
        `http://localhost:3001/product/${id}`
      )
      .then((res) => {
        if (res.data.status === "success") {
          setProduct(res.data.data);
        } else {
          setError("Produk tidak ditemukan.");
        }
      })
      .catch(() => setError("Gagal mengambil data produk."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await axios.delete(`http://localhost:3001/product/${id}`);
      if (res.data.status === "success") {
        router.push("/"); // Redirect ke halaman utama setelah sukses dihapus
      } else {
        setError(res.data.message || "Gagal menghapus produk");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        Memuat data produk...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main style={{ padding: 40, textAlign: "center", color: "#d00" }}>
        {error || "Produk tidak ditemukan."}
        <br />
        <Link href="/">Kembali ke Daftar Produk</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff5f5",
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
          boxShadow: "0 6px 26px #d001",
          padding: 32,
          border: "2px solid #f44336",
        }}
      >
        <Link href={`/product/${id}`} style={{ color: "#1976D2" }}>
          ← Batal, Kembali ke Detail Produk
        </Link>
        <h1
          style={{
            marginTop: 18,
            fontSize: 25,
            fontWeight: 700,
            color: "#f44336",
          }}
        >
          Hapus Produk
        </h1>
        <p style={{ margin: "18px 0", fontWeight: 500 }}>
          Apakah Anda yakin ingin menghapus produk berikut?
        </p>
        <div
          style={{
            margin: "20px 0",
            background: "#fff7f7",
            border: "1px solid #fdd",
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div style={{ marginBottom: 10, fontWeight: 600 }}>
            {product.title}
          </div>
          <div style={{ fontSize: 15, marginBottom: 5 }}>
            SKU: {product.sku}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#1976D2",
              fontWeight: 700,
              marginBottom: 5,
            }}
          >
            Rp{Number(product.price).toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: 15, color: "#444", marginBottom: 5 }}>
            {product.description}
          </div>
          {product.image && (
            <img
              alt={product.title}
              src={product.image}
              style={{
                width: 120,
                marginTop: 8,
                borderRadius: 8,
                display: "block",
              }}
            />
          )}
        </div>
        {error && (
          <div style={{ color: "#c00", marginBottom: 12 }}>{error}</div>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 17,
            padding: "12px 22px",
            marginTop: 12,
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.7 : 1,
            boxShadow: "0 2px 12px #f4433622",
          }}
        >
          {deleting ? "Menghapus..." : "Ya, Hapus Produk Ini"}
        </button>
      </div>
    </main>
  );
}
