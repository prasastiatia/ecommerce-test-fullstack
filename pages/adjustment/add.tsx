import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function AddAdjustmentPage() {
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Ambil price otomatis dari backend ketika SKU valid
  const fetchPriceBySku = async (skuInput: string) => {
    setPrice("");
    if (!skuInput.trim()) return;
    try {
      const res = await axios.get(
        `http://localhost:3001/product/sku/${skuInput.trim()}`
      );
      if (res.data.status === "success" && res.data.data?.price) {
        setPrice(String(res.data.data.price));
        setNotif(null);
      } else {
        setPrice("");
        setNotif({
          type: "error",
          msg: "SKU tidak ditemukan.",
        });
      }
    } catch {
      setPrice("");
      setNotif({ type: "error", msg: "SKU tidak ditemukan di database." });
    }
  };

  const handleSkuBlur = async () => {
    if (sku.trim().length >= 2) await fetchPriceBySku(sku);
    else setPrice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);

    if (
      !sku.trim() ||
      !qty ||
      Number(qty) === 0 ||
      !price ||
      Number(price) <= 0
    ) {
      setNotif({
        type: "error",
        msg: "SKU, Qty, dan Price wajib diisi. Qty ≠ 0 dan Price > 0!",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:3001/product/${sku.trim()}/adjustment`,
        { qty: Number(qty), price: Number(total) }
      );
      if (res.data.status === "success") {
        setNotif({ type: "success", msg: "Adjustment berhasil disimpan!" });
        setQty("");
      } else {
        setNotif({
          type: "error",
          msg: res.data.message || "Gagal menyimpan adjustment.",
        });
      }
    } catch (err: any) {
      setNotif({
        type: "error",
        msg: err.response?.data?.message || "Gagal menyimpan adjustment.",
      });
    } finally {
      setLoading(false);
    }
  };

  const total = qty && price ? Number(qty) * Number(price) : 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        fontFamily: "sans-serif",
        padding: "52px 0",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          margin: "auto",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 6px 24px #0002",
          padding: 32,
        }}
      >
        <Link href="/adjustment" style={{ color: "#1976D2", fontWeight: 500 }}>
          ← Lihat Daftar Adjustment
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "18px 0 16px" }}>
          Tambah Adjustment Baru
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <input
            type="text"
            placeholder="SKU Produk"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onBlur={handleSkuBlur}
            style={{
              padding: 12,
              border: "1px solid #bbb",
              borderRadius: 7,
              fontSize: 16,
            }}
            required
            autoComplete="off"
          />
          <input
            type="number"
            placeholder="Qty Adjustment (+ misal 5, - misal -3)"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{
              padding: 12,
              border: "1px solid #bbb",
              borderRadius: 7,
              fontSize: 16,
            }}
            required
          />
          <input
            type="number"
            placeholder="Harga Satuan (otomatis)"
            value={price}
            readOnly
            style={{
              padding: 12,
              border: "1px solid #bbb",
              borderRadius: 7,
              fontSize: 16,
              background: "#f4f6f8",
            }}
          />
          <input
            type="text"
            value={total === 0 ? "" : `Rp${total.toLocaleString("id-ID")}`}
            readOnly
            style={{
              padding: 12,
              border: "1px solid #bbb",
              borderRadius: 7,
              fontSize: 16,
              background: "#f2ffe4",
              color: "#1976D2",
              fontWeight: 700,
            }}
            placeholder="Total (otomatis)"
          />
          {notif && (
            <div
              style={{
                color: notif.type === "success" ? "green" : "#c00",
                fontSize: 14,
                marginTop: -4,
              }}
            >
              {notif.msg}
            </div>
          )}
          <button
            type="submit"
            style={{
              background: "#1976D2",
              color: "#fff",
              padding: "13px 0",
              border: "none",
              borderRadius: 7,
              fontWeight: 700,
              fontSize: 17,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Tambah Adjustment"}
          </button>
        </form>
        <div style={{ color: "#888", marginTop: 22, fontSize: 14 }}>
          Masukkan SKU yang benar. Harga otomatis diisi.
          <br />
          Qty positif: tambah stok, Qty negatif: kurangi stok.
          <br />
          Total = qty × harga otomatis terhitung.
        </div>
      </div>
    </main>
  );
}
