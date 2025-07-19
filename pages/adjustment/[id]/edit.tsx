import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Adjustment = {
  id: number;
  sku: string;
  qty: number;
  price: number;
  created_at: string;
};

export default function EditAdjustmentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<Adjustment | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // PREFILL: Get current adjustment (qty & sku)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`http://localhost:3001/adjustment/${id}`)
      .then(async (res) => {
        if (res.data.status === "success") {
          setData(res.data.data);
          setQty(res.data.data.qty.toString());
          // get price (always fresh from product, not from adjustment)
          const sku = res.data.data.sku;
          const pres = await axios.get(
            `http://localhost:3001/product/sku/${sku}`
          );
          if (pres.data.status === "success") {
            setPrice(String(pres.data.data.price));
          } else {
            setPrice("");
            setNotif({ type: "error", msg: "Produk tidak ditemukan" });
          }
        } else {
          setNotif({ type: "error", msg: "Adjustment tidak ditemukan" });
        }
      })
      .catch(() =>
        setNotif({ type: "error", msg: "Gagal memuat data adjustment" })
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Total otomatis berubah jika qty/price berubah
  const total = qty && price ? Number(qty) * Number(price) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);
    if (!qty || Number(qty) === 0) {
      setNotif({ type: "error", msg: "Qty tidak boleh kosong/nol!" });
      return;
    }
    setLoading(true);
    try {
      // price tidak dikirim ke backend karena akan selalu ditarik ulang pada backend
      const res = await axios.put(`http://localhost:3001/adjustment/${id}`, {
        qty: Number(qty),
      });
      if (res.data.status === "success") {
        setNotif({ type: "success", msg: "Adjustment berhasil diupdate!" });
        // update price jika perubahan harga (ambil lagi dari API produk)
        const pres = await axios.get(
          `http://localhost:3001/product/sku/${res.data.data.sku}`
        );
        if (pres.data.status === "success") {
          setPrice(String(pres.data.data.price));
        }
      } else {
        setNotif({
          type: "error",
          msg: res.data.message || "Gagal update adjustment",
        });
      }
    } catch (err: any) {
      setNotif({
        type: "error",
        msg: err.response?.data?.message || "Gagal update adjustment.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Memuat data...</div>;
  }

  if (!data) {
    return (
      <div style={{ padding: 40, color: "#c00" }}>
        Adjustment tidak ditemukan.
        <br />
        <Link href="/adjustment">Kembali ke daftar adjustment</Link>
      </div>
    );
  }

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
          ← Kembali ke Daftar Adjustment
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "18px 0 16px" }}>
          Edit Adjustment
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <input
            type="text"
            value={data.sku}
            style={{
              padding: 12,
              border: "1px solid #bbb",
              borderRadius: 7,
              fontSize: 16,
              background: "#eee",
            }}
            readOnly
            disabled
          />
          <input
            type="number"
            placeholder="Qty Adjustment"
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
              background: "#f7f7f7",
            }}
          />
          <input
            type="text"
            value={
              qty && price && qty !== "0"
                ? `Rp${total.toLocaleString("id-ID")}`
                : ""
            }
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
            Simpan Perubahan
          </button>
        </form>
      </div>
    </main>
  );
}
