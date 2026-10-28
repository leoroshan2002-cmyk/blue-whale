import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { fetchProductById, fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl, normalizeImageList } from "../utils/productImages";
import ProductCard from "../Components/ProductCard";
import "./saree-shop.css";

const colorName = (color) => typeof color === "string" ? color : color?.name || color?.value || color?.hex || "Colour";
const colorHex = (color) => typeof color === "string" ? (color.startsWith("#") ? color : "#bda18a") : color?.hex || color?.value || "#bda18a";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [productError, setProductError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  useEffect(() => {
    let cancelled = false;
    setSelectedImage(0);
    setSelectedColor(0);
    setQuantity(1);
    const load = async () => {
      setIsLoading(true);
      try {
        const [detail, all] = await Promise.all([fetchProductById(id), fetchProducts()]);
        if (!cancelled) {
          setProduct(detail);
          setCatalog(all);
          setProductError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load product:", error);
          setProduct(null);
          setProductError(error?.response?.data?.message || error?.message || "Unable to load this product.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    const refresh = () => load();
    window.addEventListener("haierah-products-updated", refresh);
    const unsubscribe = subscribeToCatalogChanges(refresh);
    return () => { cancelled = true; unsubscribe(); window.removeEventListener("haierah-products-updated", refresh); };
  }, [id]);

  const images = useMemo(() => normalizeImageList(product?.images?.length ? product.images : [product?.image]), [product]);
  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const price = Number(product?.discountPrice ?? product?.salePrice ?? product?.price ?? 0);
  const originalPrice = Number(product?.originalPrice ?? product?.compareAtPrice ?? product?.price ?? 0);
  const discount = originalPrice > price && originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
  const related = useMemo(() => catalog
    .filter((item) => (item.id || item._id) !== (product?.id || product?._id)
      && String(item.category || "").toLowerCase() === String(product?.category || "").toLowerCase())
    .slice(0, 4), [catalog, product]);

  if (!product) return <main className="bw-product-loading"><div className="bw-empty"><p className="bw-eyebrow bw-eyebrow-dark">BLUE WHALE COLLECTION</p><h2>{isLoading ? "Finding your piece…" : productError ? "Product could not be loaded" : "Product not found"}</h2><p>{productError || "This product may no longer be available."}</p><Link to="/shop?category=women">Back to collection</Link></div></main>;

  const selectedColorValue = colors[selectedColor];
  const stock = Number(product.stock ?? 0);
  const handleAdd = () => {
    if (stock <= 0) return;
    const cartItem = { ...product, price, image: images[selectedImage] || product.image, images, selectedColor: colors.length ? colorName(selectedColorValue) : "", color: colors.length ? colorName(selectedColorValue) : "", selectedColorIndex: selectedColor, qty: quantity };
    if (!requireAuthAction("addToCart", cartItem)) return;
    addToCart(cartItem);
  };
  const handleWishlist = () => { if (requireAuthAction("toggleWishlist", product)) toggleWishlist(product); };
  const categoryPath = `/shop?category=${encodeURIComponent(String(product.category || "women").toLowerCase())}${product.subCategory || product.subcategory ? `&subcategory=${encodeURIComponent(product.subCategory || product.subcategory)}` : ""}`;

  return <main className="bw-product-page">
    <div className="bw-product-breadcrumb"><Link to={categoryPath}><ArrowLeft size={15}/> Back to collection</Link><span>BLUE WHALE / {product.category || "COLLECTION"} / {product.name}</span></div>
    <section className="bw-product-detail">
      <motion.div className="bw-product-gallery" initial={{opacity:0,x:-28}} animate={{opacity:1,x:0}} transition={{duration:.8,ease:[.22,1,.36,1]}}>
        <div className="bw-product-main-image"><img key={images[selectedImage] || product.image} src={getSafeImageUrl(images[selectedImage] || product.image, DEFAULT_IMAGE_FALLBACK)} alt={product.name} onError={(e)=>{e.currentTarget.src=DEFAULT_IMAGE_FALLBACK;}}/><span className="bw-image-caption">CRAFTED WITH CARE · BLUE WHALE</span>{discount > 0 && <span className="bw-discount-tag">-{discount}%</span>}</div>
        <div className="bw-product-thumbs">{(images.length ? images : [product.image]).filter(Boolean).map((image,index)=><button type="button" key={`${image}-${index}`} onClick={()=>setSelectedImage(index)} className={selectedImage===index?"active":""} aria-label={`View product image ${index+1}`}><img src={getSafeImageUrl(image,DEFAULT_IMAGE_FALLBACK)} alt={`${product.name} view ${index+1}`} onError={(e)=>{e.currentTarget.src=DEFAULT_IMAGE_FALLBACK;}}/></button>)}</div>
        <div className="bw-image-note"><span>✳</span><p>Every weave holds a story. Make this one yours.</p></div>
      </motion.div>
      <motion.div className="bw-product-info" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.12,ease:[.22,1,.36,1]}}>
        <p className="bw-eyebrow bw-eyebrow-dark">{product.brand || "BLUE WHALE COLLECTION"}</p>
        <h1>{product.name}</h1>
        {product.rating && <div className="bw-product-rating"><span className="bw-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={Number(product.rating) >= index + 1 ? "currentColor" : "none"} />)}</span><span>{product.rating}</span>{(product.reviews || product.reviewCount) && <span className="bw-muted">({product.reviews || product.reviewCount} reviews)</span>}</div>}
        <div className="bw-product-price"><strong>₹{price.toLocaleString("en-IN")}</strong>{discount>0&&<><del>₹{originalPrice.toLocaleString("en-IN")}</del><span>{discount}% off</span></>}</div>
        <p className="bw-product-tax">Inclusive of all taxes · Shipping calculated at checkout</p>
        <div className="bw-product-divider"/>
        {product.description && <p className="bw-product-description">{product.description}</p>}
        <div className="bw-product-specs">{(product.material || product.fabric) && <div><span>FABRIC</span><strong>{product.material || product.fabric}</strong></div>}{(product.category || product.subCategory || product.subcategory) && <div><span>COLLECTION</span><strong>{product.subCategory || product.subcategory || product.category}</strong></div>}{product.sku && <div><span>PRODUCT CODE</span><strong>{product.sku}</strong></div>}</div>
        {colors.length>0&&<div className="bw-option-block"><div className="bw-option-heading"><span>COLOUR</span><strong>{colorName(selectedColorValue)}</strong></div><div className="bw-color-options">{colors.map((color,index)=><button key={`${colorName(color)}-${index}`} type="button" title={colorName(color)} aria-label={colorName(color)} className={selectedColor===index?"active":""} style={{backgroundColor:colorHex(color)}} onClick={()=>{setSelectedColor(index);if(images[index])setSelectedImage(index);}}>{selectedColor===index&&<Check size={15}/>}</button>)}</div></div>}
        {Array.isArray(product.sizes)&&product.sizes.length>0&&<div className="bw-option-block"><div className="bw-option-heading"><span>SIZE</span><button type="button" className="bw-size-help" onClick={()=>window.alert("Sarees are generally one-size drapes. Please check the product details for blouse-piece information.")}>Size guide</button></div><div className="bw-size-options">{product.sizes.map((size)=><span key={size}>{size}</span>)}</div></div>}
        <div className="bw-buy-row"><div className="bw-quantity"><button type="button" onClick={()=>setQuantity((q)=>Math.max(1,q-1))} aria-label="Decrease quantity"><Minus size={14}/></button><span>{quantity}</span><button type="button" onClick={()=>setQuantity((q)=>Math.min(Math.max(stock,1),q+1))} aria-label="Increase quantity"><Plus size={14}/></button></div><button type="button" className="bw-add-cart" disabled={stock<=0} onClick={handleAdd}><ShoppingBag size={17}/>{stock<=0?"Currently unavailable":"Add to bag"}</button><button type="button" className={`bw-wishlist ${isWishlisted(product.id || product._id)?"saved":""}`} onClick={handleWishlist} aria-label="Add to wishlist"><Heart size={19} fill={isWishlisted(product.id || product._id)?"currentColor":"none"}/></button></div>
        <p className={`bw-stock ${stock>0?"in-stock":"out-stock"}`}><span/> {stock>0?"Ready to ship · In stock":"Currently out of stock"}</p>
        <div className="bw-promises"><div><Truck size={18}/><span><strong>Thoughtful delivery</strong><small>Carefully packed for you</small></span></div><div><ShieldCheck size={18}/><span><strong>Made to be treasured</strong><small>Quality you can feel</small></span></div></div>
        <details className="bw-detail-accordion"><summary>Product details <span>+</span></summary><p>{product.description || "A carefully selected piece from our collection."}</p>{product.care && <p>Care: {Array.isArray(product.care)?product.care.join(" · "):product.care}</p>}</details>
        <details className="bw-detail-accordion"><summary>Shipping & returns <span>+</span></summary><p>Your piece is prepared with care. Delivery estimates and return eligibility are confirmed during checkout.</p></details>
      </motion.div>
    </section>
    {related.length>0&&<section className="bw-related"><div className="bw-related-heading"><div><p className="bw-eyebrow bw-eyebrow-dark">THE ART OF THE DRAPE</p><h2>You may also love</h2></div><Link to={categoryPath}>View collection ↗</Link></div><div className="bw-related-grid">{related.map((item)=><ProductCard key={item.id||item._id} product={item} showButtons={false}/>)}</div></section>}
  </main>;
}
