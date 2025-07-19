import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useProductStore, Product, useCartStore } from "../lib/store";

const PAGE_SIZE = 8;

export default function Home() {
  const products = useProductStore((s) => s.products);
  const setProducts = useProductStore((s) => s.setProducts);
  //   const addToCart = useProductStore((s) => s.addToCart);
  const addToCart = useProductStore((s) => s.addToCart);

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products from API (with dummy images)
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get<Product[]>(
        "http://localhost:3001/list-products"
      );
      setProducts(
        res.data.map((p) => ({
          ...p,
          image:
            p.image && p.image.trim() !== ""
              ? p.image
              : `https://source.unsplash.com/featured/250x180?product,${encodeURIComponent(
                  p.title
                )}`,
        }))
      );
    };
    fetchProducts();
  }, [setProducts]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);

  // Only show products of current page
  const pageProducts = useMemo(
    () =>
      products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [products, currentPage]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
          maxWidth: 1024,
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
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Daftar Produk</h1>

          <Link
            href="/product/add"
            style={{ color: "#1976D2", fontWeight: 500 }}
          >
            Add New Product
          </Link>

          <Link
            href="/adjustment"
            style={{ color: "#1976D2", fontWeight: 500 }}
          >
            Lihat Adjustment Transaction
          </Link>

          <Link href="/cart" style={{ color: "#1976D2", fontWeight: 500 }}>
            Lihat Keranjang
          </Link>
        </div>

        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 28,
          }}
        >
          {products.length === 0 &&
            [...Array(PAGE_SIZE)].map((_, idx) => (
              <div
                key={idx}
                style={{ height: 250, borderRadius: 10, background: "#f3f3f3" }}
              />
            ))}
          {pageProducts.map((prod) => (
            <div
              key={prod.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                boxShadow: "0 2px 10px #0001",
                padding: 16,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={prod.image}
                alt={prod.title}
                style={{
                  objectFit: "cover",
                  width: 180,
                  height: 130,
                  borderRadius: 10,
                  marginBottom: 16,
                  background: "#fafafa",
                }}
              />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {prod.title}
              </div>
              <div
                style={{
                  color: "#040405ff",
                  fontWeight: 500,
                  marginBottom: 12,
                }}
              >
                Stock {prod.stock}
              </div>
              <div
                style={{ color: "#1976D2", fontWeight: 500, marginBottom: 12 }}
              >
                Rp{Number(prod.price).toLocaleString("id-ID")}
              </div>
              <button
                onClick={() => addToCart(prod)}
                style={{
                  padding: "7px 20px",
                  background: "#1976D2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                + Tambah ke Keranjang
              </button>
              <Link
                href={`/product/${prod.id}`}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    marginTop: 8,
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid #1976D2",
                    background: "transparent",
                    color: "#1976D2",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Detail Produk
                </button>
              </Link>
              <br></br>
              <Link
                href={`/product/${prod.id}/edit`}
                style={{
                  textDecoration: "none",
                  marginLeft: 8,
                }}
              >
                <button
                  style={{
                    padding: "6px 13px",
                    borderRadius: 6,
                    border: "1px solid #FF9800",
                    color: "#FF9800",
                    background: "#FFFBEA",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit Product
                </button>
              </Link>
              <br></br>
              <Link
                href={`/product/${prod.id}/delete`}
                style={{ textDecoration: "none", marginLeft: 8 }}
              >
                <button
                  style={{
                    padding: "6px 13px",
                    borderRadius: 6,
                    border: "1px solid #f44336",
                    color: "#f44336",
                    background: "#fff5f5",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Delete Product
                </button>
              </Link>
            </div>
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <nav style={{ marginTop: 32, textAlign: "center" }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "7px 14px",
                marginRight: 14,
                borderRadius: 6,
                border: 0,
                background: currentPage === 1 ? "#eee" : "#1976D2",
                color: currentPage === 1 ? "#888" : "#fff",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}
            >
              {"< Sebelumnya"}
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                style={{
                  padding: "7px 10px",
                  margin: "0 3px",
                  borderRadius: 6,
                  border: 0,
                  background: currentPage === i + 1 ? "#1976D2" : "#f2f2f2",
                  color: currentPage === i + 1 ? "#fff" : "#222",
                  fontWeight: currentPage === i + 1 ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "7px 14px",
                marginLeft: 14,
                borderRadius: 6,
                border: 0,
                background: currentPage === totalPages ? "#eee" : "#1976D2",
                color: currentPage === totalPages ? "#888" : "#fff",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}
            >
              {"Berikutnya >"}
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
