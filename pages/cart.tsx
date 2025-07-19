import Link from "next/link";
import { useProductStore } from "../lib/store";
import { useState } from "react";
import axios from "axios";

export default function CartPage() {
  const cart = useProductStore((s) => s.cart);
  const removeFromCart = useProductStore((s) => s.removeFromCart);
  const clearCart = useProductStore((s) => s.clearCart);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | "success" | "error">(
    null
  );

  const handleSaveCart = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      // Membentuk payload cart yang akan dikirim ke backend
      const payload = cart.map((item) => ({
        product_id: item.id,
        sku: item.sku,
        qty: item.qty,
        price: item.price,
      }));

      const res = await axios.post("http://localhost:3001/order", {
        cart: payload,
      });
      if (res.data.status === "success") {
        clearCart();
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      style={{
        padding: "56px 0",
        minHeight: "100vh",
        background: "#f6f7fb",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 6px 26px #0001",
          padding: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Keranjang</h1>
          <Link href="/" style={{ color: "#1976D2", fontWeight: 500 }}>
            Kembali ke Home
          </Link>
        </div>
        {cart.length === 0 ? (
          <div
            style={{
              margin: 40,
              color: "#888",
              fontSize: 18,
              textAlign: "center",
            }}
          >
            Keranjang masih kosong.
          </div>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                marginTop: 24,
              }}
            >
              <thead>
                <tr style={{ background: "#fbfbfb" }}>
                  <th
                    style={{
                      padding: 10,
                      borderBottom: "1.5px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    Produk
                  </th>
                  <th
                    style={{
                      padding: 10,
                      borderBottom: "1.5px solid #eee",
                      textAlign: "center",
                    }}
                  >
                    Qty
                  </th>
                  <th
                    style={{
                      padding: 10,
                      borderBottom: "1.5px solid #eee",
                      textAlign: "right",
                    }}
                  >
                    Subtotal
                  </th>
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #f1f1f1" }}
                  >
                    <td
                      style={{
                        verticalAlign: "middle",
                        padding: 10,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span>{item.sku}</span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 500 }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 500 }}>
                      Rp{Number(item.price * item.qty).toLocaleString("id-ID")}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#c00",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                        title="Hapus"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} />
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      fontSize: 18,
                      borderTop: "2px solid #eee",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      fontSize: 18,
                      borderTop: "2px solid #eee",
                    }}
                  >
                    Rp{Number(total).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
                gap: 12,
              }}
            >
              <button
                onClick={clearCart}
                style={{
                  padding: "8px 22px",
                  background: "#c00",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontWeight: 500,
                  marginRight: 12,
                }}
              >
                Hapus Semua
              </button>
              <button
                onClick={handleSaveCart}
                disabled={isSaving}
                style={{
                  padding: "8px 22px",
                  background: "#1976D2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  minWidth: 120,
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Menyimpan..." : "Checkout"}
              </button>
            </div>
            {saveStatus === "success" && (
              <div style={{ color: "green", marginTop: 20 }}>
                Keranjang berhasil disimpan ke database!
              </div>
            )}
            {saveStatus === "error" && (
              <div style={{ color: "red", marginTop: 20 }}>
                Gagal menyimpan keranjang. Silakan coba lagi.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
