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
type Adjustment = {
  id: number;
  sku: string;
  qty: number;
  created_at: string;
};

export default function AdjustmentTransactionPage() {
  const router = useRouter();
  const { sku } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!sku) return;
    setLoading(true);
    Promise.all([
      axios.get<{ status: string; data: Product }>(
        `http://localhost:3001/product/sku/${sku}`
      ),
      axios.get<{ status: string; data: Adjustment[] }>(
        `http://localhost:3001/product/${sku}/adjustments`
      ),
    ])
      .then(([prod, adj]) => {
        setProduct(prod.data.data || null);
        setAdjustments(adj.data.data || []);
      })
      .catch(() => setError("Gagal load data"))
      .finally(() => setLoading(false));
  }, [sku]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    if (!qty || Number(qty) === 0) {
      setError("Qty wajib diisi dan tidak boleh nol");
      setIsSubmitting(false);
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:3001/product/${sku}/adjustment`,
        {
          qty: Number(qty),
        }
      );
      if (res.data.status === "success") {
        setProduct(res.data.data.product);
        setAdjustments((prev) => [res.data.data.adjustment, ...prev]);
        setQty("");
        setSuccess("Transaksi adjustment berhasil disimpan!");
      } else {
        setError(res.data.message || "Transaksi gagal");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Transaksi gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <main style={{ padding: 40, textAlign: "center" }}>Memuat data...</main>
    );
  if (error || !product)
    return (
      <main style={{ padding: 40, textAlign: "center", color: "#d00" }}>
        {error || "Produk tidak ditemukan."}
        <br />
        <Link href="/">Kembali ke Daftar Produk</Link>
      </main>
    );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        fontFamily: "sans-serif",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          maxWidth: 580,
          margin: "auto",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 18px #0001",
          padding: 36,
        }}
      >
        <Link href={`/product/${product.id}`} style={{ color: "#1976D2" }}>
          ← Kembali ke Detail Produk
        </Link>
        <h1 style={{ marginTop: 18, fontSize: 25, fontWeight: 700 }}>
          Adjustment Stok Produk
        </h1>
        <div
          style={{
            background: "#f9fafb",
            padding: 20,
            borderRadius: 9,
            margin: "20px 0 30px 0",
            border: "1px solid #eee",
          }}
        >
          <b>{product.title}</b>
          <div>
            SKU: {product.sku} | Harga: Rp
            {Number(product.price).toLocaleString("id-ID")}
          </div>
          <div style={{ color: "#1976D2", marginTop: 6, fontWeight: 700 }}>
            Stok Saat Ini: {product.stock}
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <div style={{ marginBottom: 12 }}>
            <label>Qty Adjustment (+ menambah, - mengurangi)</label>
            <br />
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              style={{
                padding: 11,
                borderRadius: 7,
                border: "1px solid #ccc",
                width: 140,
                marginRight: 10,
              }}
              placeholder="+10 atau -2"
              required
            />
          </div>
          {error && (
            <div style={{ color: "#d00", fontSize: 14, marginBottom: 8 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color: "green", fontSize: 14, marginBottom: 8 }}>
              {success}
            </div>
          )}
          <button
            type="submit"
            style={{
              background: "#1976D2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 17,
              padding: "11px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.75 : 1,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Proses Adjustment"}
          </button>
        </form>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>
          Histori Adjustment
        </h2>
        {adjustments.length === 0 ? (
          <div style={{ color: "#bbb" }}>Belum ada histori adjustment.</div>
        ) : (
          <table
            style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "#fbfbfb" }}>
                <th
                  style={{ width: 110, textAlign: "left", padding: "8px 6px" }}
                >
                  Waktu
                </th>
                <th style={{ textAlign: "center", width: 100 }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((adj) => (
                <tr key={adj.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px 6px", fontSize: 13 }}>
                    {new Date(adj.created_at).toLocaleString("id-ID")}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      color:
                        adj.qty > 0
                          ? "green"
                          : adj.qty < 0
                          ? "#f44336"
                          : "#555",
                      fontWeight: 600,
                    }}
                  >
                    {adj.qty > 0 ? `+${adj.qty}` : adj.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
