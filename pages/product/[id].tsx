import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useProductStore, Product } from "../../lib/store";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const addToCart = useProductStore((state) => state.addToCart);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      try {
        // Asumsi API Fastify menyediakan endpoint GET /product/:id
        const res = await axios.get<{ status: string; data: Product }>(
          `http://localhost:3001/product/${id}`
        );
        if (res.data.status === "success") {
          setProduct({
            ...res.data.data,
            image:
              res.data.data.image && res.data.data.image.trim() !== ""
                ? res.data.data.image
                : `https://source.unsplash.com/featured/250x180?product,${encodeURIComponent(
                    res.data.data.title
                  )}`,
          });
        } else {
          setProduct(null);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#d00" }}>
        Produk tidak ditemukan.
        <br />
        <Link href="/">Kembali ke Daftar Produk</Link>
      </div>
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: 700,
        margin: "auto",
      }}
    >
      <Link
        href="/"
        style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}
      >
        ← Kembali ke Daftar Produk
      </Link>
      <div
        style={{
          boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          padding: 20,
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          style={{
            width: "100%",
            height: 320,
            objectFit: "cover",
            borderRadius: 12,
            marginBottom: 16,
          }}
        />
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{product.title}</h1>
        {product.sku && (
          <p style={{ color: "#666", marginBottom: 4 }}>SKU: {product.sku}</p>
        )}
        {/* {typeof product.stock === 'number' && (
          <p style={{ color: product.stock > 0 ? 'green' : '#d00', fontWeight: 'bold', marginBottom: 8 }}>
            {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok habis'}
          </p>
        )} */}
        <p
          style={{
            fontWeight: 600,
            fontSize: 22,
            color: "#1976D2",
            marginBottom: 12,
          }}
        >
          Rp{Number(product.price).toLocaleString("id-ID")}
        </p>
        {product.description && (
          <p style={{ marginBottom: 18, lineHeight: 1.5, color: "#444" }}>
            {product.description}
          </p>
        )}
        {/* <button
          onClick={() => addToCart(product)}
          style={{
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600
          }}
          disabled={product.stock === 0}
          title={product.stock === 0 ? 'Stok habis' : 'Tambah ke keranjang'}
        >
          {product.stock === 0 ? 'Tidak Tersedia' : 'Tambah ke Keranjang'}
        </button> */}
      </div>
    </main>
  );
}
