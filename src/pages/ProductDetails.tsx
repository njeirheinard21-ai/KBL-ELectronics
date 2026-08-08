import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, Star, Check, ArrowLeft, Shield, Truck, RotateCcw } from "lucide-react";
import { productService } from "../services/productService";
import { useCartStore } from "../store/useCartStore";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "../components/shared/ProductCard";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const [activeTab, setActiveTab] = useState('description');

  // Customer Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([
    {
      id: "rev-1",
      author: "Alex Thompson",
      rating: 5,
      date: "2 days ago",
      comment: "Exceptional build quality and lightning-fast delivery. Exceeded my expectations!"
    },
    {
      id: "rev-2",
      author: "Sarah Jenkins",
      rating: 5,
      date: "1 week ago",
      comment: "Super crisp display and incredible battery life. Highly recommended for power users."
    },
    {
      id: "rev-3",
      author: "David Miller",
      rating: 4,
      date: "2 weeks ago",
      comment: "Great value for money. Performance is top notch for gaming and daily tasks."
    }
  ]);

  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { 
    data: product, 
    isLoading: loading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productService.getProductById(id) : Promise.resolve(null),
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', id],
    queryFn: () => id ? productService.getRelatedProducts(id, 4) : Promise.resolve([]),
    enabled: !!id && !!product,
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      date: "Just now",
      comment: newComment.trim(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewAuthor("");
    setNewComment("");
    setNewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-display font-bold text-red-400 mb-4">Failed to Load Product</h2>
        <p className="text-fg-muted mb-8 max-w-md">There was a problem retrieving product details from the database.</p>
        <div className="flex gap-4">
          <Button onClick={() => refetch()} size="lg" className="px-8 rounded-full bg-brand-primary text-white">
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 rounded-full border-white/20 text-white">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-display font-bold text-white mb-4">Product Not Found</h2>
        <p className="text-fg-muted mb-8 max-w-md">We couldn't find the product you're looking for.</p>
        <Button asChild size="lg" className="px-8 rounded-full">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Helmet>
        <title>{`${product.name} - KBL Electronics`}</title>
        <meta name="description" content={`Buy ${product.name} at KBL Electronics. ${product.features?.join(', ')}`} />
        <link rel="canonical" href={`https://kbl-electronics.com/product/${product.id}`} />
        <meta property="og:title" content={`${product.name} - KBL Electronics`} />
        <meta property="og:description" content={`Buy ${product.name} at KBL Electronics.`} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": [product.image],
            "description": `Buy ${product.name} at KBL Electronics. ${product.features?.join(', ')}`,
            "brand": {
              "@type": "Brand",
              "name": product.brand
            },
            "offers": {
              "@type": "Offer",
              "url": `https://kbl-electronics.com/product/${product.id}`,
              "priceCurrency": "USD",
              "price": product.price,
              "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating,
              "reviewCount": product.reviews
            }
          })}
        </script>
      </Helmet>

      <Link to="/" className="inline-flex items-center text-fg-muted hover:text-white transition-colors mb-8 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-20">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 flex items-center justify-center relative min-h-[260px] sm:min-h-[400px]">
          {product.isNew && (
            <span className="absolute top-4 sm:top-6 left-4 sm:left-6 rounded bg-brand-primary px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black shadow-sm z-10">
              New Arrival
            </span>
          )}
          {product.hasDeal && product.originalPrice && (
            <span className="absolute top-4 sm:top-6 left-4 sm:left-6 rounded bg-brand-accent px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white shadow-sm z-10">
              Save ${Math.round(product.originalPrice - product.price)}
            </span>
          )}
          <img 
            src={product.image} 
            alt={product.name} 
            fetchPriority="high"
            className="w-full max-w-[280px] sm:max-w-[400px] object-contain mix-blend-screen"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-mono opacity-50 uppercase tracking-widest text-white mb-3">
            <span>{product.brand}</span>
            <span>&bull;</span>
            <Link to={`/categories/${product.category.toLowerCase()}`} className="hover:text-brand-primary transition-colors">
              {product.category}
            </Link>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
            <div className="flex items-center text-brand-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`} />
              ))}
            </div>
            <span className="text-white font-bold text-sm sm:text-base">{product.rating}</span>
            <span className="text-fg-muted text-xs sm:text-sm">({product.reviews + reviewsList.length - 3} reviews)</span>
          </div>

          <div className="flex items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className="text-3xl sm:text-4xl font-display font-bold text-brand-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-lg sm:text-xl text-fg0 line-through mb-1">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="space-y-6 mb-10">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Key Features</h3>
            <ul className="space-y-3">
              {product.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start text-fg-muted">
                  <Check className="h-5 w-5 text-brand-primary mr-3 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {!product.features?.length && (
                <li className="flex items-start text-fg-muted">
                  <Check className="h-5 w-5 text-brand-primary mr-3 shrink-0" />
                  <span>Premium build quality</span>
                </li>
              )}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <Button 
              size="lg" 
              className={`w-full h-14 rounded-xl text-sm font-bold tracking-widest uppercase mb-4 ${(!product.inStock || added) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              disabled={!product.inStock || added}
              onClick={handleAddToCart}
            >
              {added ? (
                <span aria-live="polite" className="inline-flex items-center">
                  <Check className="mr-2 h-5 w-5" /> Added to Cart
                </span>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" /> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5 text-center">
              <div className="flex flex-col items-center justify-center">
                <Truck className="h-6 w-6 text-fg-muted mb-2" />
                <span className="text-[10px] text-fg-muted uppercase tracking-widest">Free Ship</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Shield className="h-6 w-6 text-fg-muted mb-2" />
                <span className="text-[10px] text-fg-muted uppercase tracking-widest">Warranty</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <RotateCcw className="h-6 w-6 text-fg-muted mb-2" />
                <span className="text-[10px] text-fg-muted uppercase tracking-widest">Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-16 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-white/10 text-brand-primary border-b-2 border-brand-primary' 
                  : 'text-fg-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab} {tab === 'reviews' ? `(${reviewsList.length})` : ''}
            </button>
          ))}
        </div>
        
        <div className="p-8 lg:p-12 min-h-[300px]">
          {activeTab === 'description' && (
            <div className="prose prose-invert max-w-none text-fg-muted">
              <h3 className="text-2xl font-display font-bold text-white mb-6">Product Overview</h3>
              <p className="mb-4">
                Experience the next level of innovation with the {product.name}. Designed to seamlessly integrate into your daily life, this device offers unparalleled performance, stunning aesthetics, and advanced capabilities that empower you to do more.
              </p>
              <p>
                Whether you're a professional seeking reliability or a casual user looking for premium quality, the {product.name} delivers on all fronts. With its robust construction and intuitive interface, it's not just a tool—it's an extension of you.
              </p>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-2xl font-display font-bold text-white mb-6">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-fg-muted">Brand</span>
                  <span className="font-medium text-white">{product.brand}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-fg-muted">Category</span>
                  <span className="font-medium text-white">{product.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-fg-muted">Model Year</span>
                  <span className="font-medium text-white">2026</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-fg-muted">Warranty</span>
                  <span className="font-medium text-white">1 Year Limited</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <div className="text-6xl font-display font-bold text-white">{product.rating}</div>
                  <div className="flex flex-col">
                    <div className="flex items-center text-brand-primary mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-fg-muted">Based on verified customer reviews</span>
                  </div>
                </div>
              </div>

              {/* Submit Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-bold text-white">Write a Customer Review</h4>
                {reviewSubmitted && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
                    Thank you! Your review has been submitted successfully.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="review-author" className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      id="review-author"
                      required
                      type="text"
                      placeholder="e.g. Sarah M."
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="review-rating" className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-1">Rating</label>
                    <select
                      id="review-rating"
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary"
                    >
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Average</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="1">1 Star - Poor</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="review-comment" className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-1">Your Review</label>
                  <textarea
                    id="review-comment"
                    required
                    rows={3}
                    placeholder="Share your thoughts about this product..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <Button type="submit" className="font-bold">Submit Review</Button>
              </form>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{rev.author}</span>
                          <span className="text-xs text-fg0">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-brand-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-fg-muted text-sm mt-3">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-display font-bold text-white mb-8 border-b border-white/10 pb-4">Frequently Bought Together & Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
