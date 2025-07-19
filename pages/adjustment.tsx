import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";

type Adjustment = {
  id: number;
  sku: string;
  qty: number;
  created_at: string;
  price: number;
};

const PAGE_SIZE = 10;

export default function AdjustmentListPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios
      .get<{ status: string; data: Adjustment[] }>(
        "http://localhost:3001/adjustments"
      )
      .then((res) => {
        if (res.data.status === "success") {
          setAdjustments(res.data.data);
        } else {
          setError("Gagal memuat data");
        }
      })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  const router = useRouter();

  // Fungsi untuk menghapus adjustment
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus adjustment ini?")) return;
    try {
      await axios.delete(`http://localhost:3001/adjustment/${id}`);
      setAdjustments((prev) => prev.filter((adj) => adj.id !== id));
    } catch {
      alert("Gagal menghapus adjustment.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(adjustments.length / PAGE_SIZE);
  const pageAdjustments = useMemo(
    () => adjustments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [adjustments, page]
  );

  return (
    <main
      style={{
        padding: 36,
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 780,
          margin: "auto",
          background: "#fff",
          borderRadius: 15,
          boxShadow: "0 5px 20px #00000011",
          padding: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Daftar Adjustment Transaksi
          </h1>
          <Link
            href="/adjustment/add"
            style={{
              background: "#1976D2",
              color: "#fff",
              padding: "8px 18px",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
              alignSelf: "flex-start",
            }}
          >
            + Tambah Adjustment
          </Link>
        </div>
        {loading ? (
          <div>Memuat data...</div>
        ) : error ? (
          <div style={{ color: "#d00" }}>{error}</div>
        ) : (
          <>
            {adjustments.length === 0 ? (
              <div style={{ color: "#888" }}>
                Belum ada transaksi adjustment.
              </div>
            ) : (
              <>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f2f5f8" }}>
                      <th
                        style={{
                          padding: "9px 5px",
                          textAlign: "left",
                          borderBottom: "2px solid #eee",
                        }}
                      >
                        Waktu
                      </th>
                      <th
                        style={{
                          padding: "9px 5px",
                          textAlign: "center",
                          borderBottom: "2px solid #eee",
                        }}
                      >
                        SKU
                      </th>
                      <th
                        style={{
                          padding: "9px 5px",
                          textAlign: "center",
                          borderBottom: "2px solid #eee",
                        }}
                      >
                        Qty
                      </th>
                      <th
                        style={{
                          padding: "9px 5px",
                          textAlign: "center",
                          borderBottom: "2px solid #eee",
                        }}
                      >
                        Price
                      </th>
                      <th
                        style={{
                          padding: "9px 5px",
                          textAlign: "center",
                          borderBottom: "2px solid #eee",
                        }}
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageAdjustments.map((adj) => (
                      <tr
                        key={adj.id}
                        style={{ borderBottom: "1px solid #f4f4f4" }}
                      >
                        <td style={{ padding: "8px 5px", fontSize: 14 }}>
                          {new Date(adj.created_at).toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            color: "#1976D2",
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {adj.sku}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            color: adj.qty > 0 ? "green" : "red",
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {adj.qty > 0 ? "+" : ""}
                          {adj.qty}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            color: "#1976D2",
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {adj.price}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() =>
                              router.push(`/adjustment/${adj.id}/edit`)
                            }
                            style={{
                              marginRight: 10,
                              color: "#1976D2",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            title="Edit adjustment"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(adj.id)}
                            style={{
                              color: "#d32f2f",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            title="Hapus adjustment"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                <nav style={{ marginTop: 24, textAlign: "center" }}>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    style={{
                      padding: "7px 14px",
                      marginRight: 10,
                      borderRadius: 6,
                      border: 0,
                      background: page === 1 ? "#eee" : "#1976D2",
                      color: page === 1 ? "#888" : "#fff",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {"< Sebelumnya"}
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{
                        padding: "7px 10px",
                        margin: "0 3px",
                        borderRadius: 6,
                        border: 0,
                        background: page === i + 1 ? "#1976D2" : "#f2f2f2",
                        color: page === i + 1 ? "#fff" : "#222",
                        fontWeight: page === i + 1 ? 700 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    style={{
                      padding: "7px 14px",
                      marginLeft: 10,
                      borderRadius: 6,
                      border: 0,
                      background: page === totalPages ? "#eee" : "#1976D2",
                      color: page === totalPages ? "#888" : "#fff",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {"Berikutnya >"}
                  </button>
                </nav>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
