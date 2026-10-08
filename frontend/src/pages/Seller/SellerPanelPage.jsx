import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, LayoutPanelTop, LogOut, Package, Plus, Trash2 } from 'lucide-react';
import { heroApi } from '../../api/hero.api';
import { productApi } from '../../api/product.api';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { formatErrorMessage } from '../../utils/errorHelpers';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const initialProduct = {
  title: '',
  shortDescription: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '10',
  occasion: 'everyday',
  fabric: 'silk',
  tags: '',
};

const initialHero = {
  title: 'Tradition, woven for today.',
  subtitle: 'Discover heirloom handloom sarees made for the moments that matter — timeless Indian craftsmanship, reimagined for the way you live now.',
  badge: 'Vanya / Modern Heritage',
  layout: 'split',
  image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=90',
  productId: '',
  ctaText: 'Explore the collection',
  ctaLink: '/shop',
  order: '0',
};

export default function SellerPanelPage() {
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState(initialProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [hero, setHero] = useState(initialHero);
  const [heroImage, setHeroImage] = useState(null);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [deletingHeroId, setDeletingHeroId] = useState(null);
  const { user, logout } = useAuth();
  const { addToast } = useUI();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => productApi.getSellerProducts(),
  });
  const { data: heroData, isLoading: isHeroLoading } = useQuery({
    queryKey: ['manage-hero-slides'],
    queryFn: () => heroApi.getManageHeroSlides(),
  });
  const products = productsData?.products || [];
  const heroSlides = heroData?.slides || [];

  const updateProduct = (field, value) => {
    setProduct((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (imageFiles.length === 0) {
      addToast({ type: 'error', message: 'Add at least one product image' });
      return;
    }

    setIsSaving(true);
    try {
      await productApi.createProduct(
        { ...product, category: product.occasion, frontImageIndex: 0 },
        imageFiles,
      );
      await queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setProduct(initialProduct);
      setImageFiles([]);
      setShowForm(false);
      addToast({ type: 'success', message: 'Product published' });
    } catch (error) {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product permanently?')) return;

    setDeletingId(productId);
    try {
      await productApi.deleteSellerProduct(productId);
      await queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      addToast({ type: 'success', message: 'Product deleted' });
    } catch (error) {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateHero = async (event) => {
    event.preventDefault();
    if (!heroImage && !hero.productId && !hero.title.trim() && !hero.subtitle.trim()) {
      addToast({ type: 'error', message: 'Add a hero image, title, or description' });
      return;
    }

    setIsSavingHero(true);
    try {
      await heroApi.createHeroSlide(hero, heroImage);
      await queryClient.invalidateQueries({ queryKey: ['manage-hero-slides'] });
      setHero(initialHero);
      setHeroImage(null);
      setShowHeroForm(false);
      addToast({ type: 'success', message: 'Hero slide published' });
    } catch (error) {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleDeleteHero = async (slideId) => {
    if (!window.confirm('Delete this hero slide permanently?')) return;

    setDeletingHeroId(slideId);
    try {
      await heroApi.deleteHeroSlide(slideId);
      await queryClient.invalidateQueries({ queryKey: ['manage-hero-slides'] });
      addToast({ type: 'success', message: 'Hero slide deleted' });
    } catch (error) {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    } finally {
      setDeletingHeroId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-cream/40 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sand/40 pb-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide-luxury text-wine">Private workspace</span>
            <h1 className="mt-1 font-serif text-3xl font-light text-charcoal sm:text-4xl">Seller Console</h1>
            <p className="mt-1 text-xs text-taupe">Signed in as {user?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </header>

        <section className="rounded-brand border border-sand/40 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-brand bg-wine/10 text-wine">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-luxury text-charcoal">Inventory</p>
                <p className="text-xs text-taupe">{productsData?.pagination?.totalProducts ?? 0} products in your catalog</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowForm((visible) => !visible)} className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" />
              <span>{showForm ? 'Close Form' : 'Add Product'}</span>
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-6 space-y-4 border-t border-sand/30 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Product Title" value={product.title} onChange={(event) => updateProduct('title', event.target.value)} required />
                <Input label="Short Description" value={product.shortDescription} onChange={(event) => updateProduct('shortDescription', event.target.value)} required />
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-charcoal">Full Description</span>
                <textarea value={product.description} onChange={(event) => updateProduct('description', event.target.value)} required rows="4" className="w-full rounded-brand border border-sand/60 bg-ivory/40 px-3 py-2 text-sm outline-none focus:border-wine" />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Price (₹)" type="number" min="0" value={product.price} onChange={(event) => updateProduct('price', event.target.value)} required />
                <Input label="Sale Price (₹)" type="number" min="0" value={product.discountPrice} onChange={(event) => updateProduct('discountPrice', event.target.value)} />
                <Input label="Stock" type="number" min="0" value={product.stock} onChange={(event) => updateProduct('stock', event.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-charcoal">Occasion</span>
                  <select value={product.occasion} onChange={(event) => updateProduct('occasion', event.target.value)} className="h-10 w-full rounded-brand border border-sand/60 bg-ivory/40 px-3 text-sm outline-none focus:border-wine">
                    <option value="everyday">Everyday</option>
                    <option value="festive">Festive</option>
                    <option value="wedding">Wedding</option>
                    <option value="statement">Statement</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-charcoal">Fabric</span>
                  <select value={product.fabric} onChange={(event) => updateProduct('fabric', event.target.value)} className="h-10 w-full rounded-brand border border-sand/60 bg-ivory/40 px-3 text-sm outline-none focus:border-wine">
                    <option value="silk">Silk</option>
                    <option value="organza">Organza</option>
                    <option value="chiffon">Chiffon</option>
                    <option value="georgette">Georgette</option>
                    <option value="linen">Linen</option>
                  </select>
                </label>
              </div>
              <Input label="Tags (comma separated)" value={product.tags} onChange={(event) => updateProduct('tags', event.target.value)} placeholder="handloom, festive, gold" />
              <label className="block rounded-brand border border-dashed border-sand bg-cream/30 p-4 text-center">
                <ImagePlus className="mx-auto h-5 w-5 text-wine" />
                <span className="mt-2 block text-xs font-medium text-charcoal">Product Images</span>
                <span className="mt-1 block text-[11px] text-taupe">Select one or more images; the first is the cover.</span>
                <input type="file" accept="image/*" multiple required onChange={(event) => setImageFiles(Array.from(event.target.files || []))} className="mt-3 block w-full text-xs text-taupe file:mr-3 file:rounded-brand file:border-0 file:bg-wine file:px-3 file:py-2 file:text-xs file:font-medium file:text-ivory" />
              </label>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>Publish Product</Button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-brand border border-sand/40 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-brand bg-wine/10 text-wine">
                <LayoutPanelTop className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-luxury text-charcoal">Homepage Hero</p>
                <p className="text-xs text-taupe">Manage the banners shown at the top of the storefront.</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowHeroForm((visible) => !visible)} className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" />
              <span>{showHeroForm ? 'Close Form' : 'Add Hero Slide'}</span>
            </Button>
          </div>

          {showHeroForm && (
            <form onSubmit={handleCreateHero} className="mt-6 space-y-4 border-t border-sand/30 pt-6">
              <p className="text-xs text-taupe">Create a backend-managed banner with an image beside the text, or use the classic text-over-image style. Replace the starter image URL or upload your own image.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Hero Title" value={hero.title} onChange={(event) => setHero((current) => ({ ...current, title: event.target.value }))} />
                <Input label="Badge" value={hero.badge} onChange={(event) => setHero((current) => ({ ...current, badge: event.target.value }))} />
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-charcoal">Banner Layout</span>
                <select
                  value={hero.layout}
                  onChange={(event) => setHero((current) => ({ ...current, layout: event.target.value }))}
                  className="h-10 w-full rounded-brand border border-sand/60 bg-ivory/40 px-3 text-sm outline-none focus:border-wine"
                >
                  <option value="split">Image beside text (no overlay)</option>
                  <option value="overlay">Text over image</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-charcoal">Hero Description</span>
                <textarea value={hero.subtitle} onChange={(event) => setHero((current) => ({ ...current, subtitle: event.target.value }))} rows="3" className="w-full rounded-brand border border-sand/60 bg-ivory/40 px-3 py-2 text-sm outline-none focus:border-wine" />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-charcoal">Linked Product</span>
                <select value={hero.productId} onChange={(event) => setHero((current) => ({ ...current, productId: event.target.value, image: event.target.value ? '' : current.image }))} className="h-10 w-full rounded-brand border border-sand/60 bg-ivory/40 px-3 text-sm outline-none focus:border-wine">
                  <option value="">No linked product</option>
                  {products.map((catalogProduct) => <option key={catalogProduct._id} value={catalogProduct._id}>{catalogProduct.title}</option>)}
                </select>
                <span className="block text-[11px] text-taupe">Optional. A linked product can supply the banner image when no image is uploaded.</span>
              </label>
              <label className="block rounded-brand border border-dashed border-sand bg-cream/30 p-4 text-center">
                <ImagePlus className="mx-auto h-5 w-5 text-wine" />
                <span className="mt-2 block text-xs font-medium text-charcoal">Hero Image</span>
                <span className="mt-1 block text-[11px] text-taupe">An uploaded image replaces the image URL below.</span>
                <input type="file" accept="image/*" onChange={(event) => setHeroImage(event.target.files?.[0] || null)} className="mt-3 block w-full text-xs text-taupe file:mr-3 file:rounded-brand file:border-0 file:bg-wine file:px-3 file:py-2 file:text-xs file:font-medium file:text-ivory" />
              </label>
              <Input label="Hero Image URL" value={hero.image} onChange={(event) => setHero((current) => ({ ...current, image: event.target.value }))} placeholder="https://…" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Button Text" value={hero.ctaText} onChange={(event) => setHero((current) => ({ ...current, ctaText: event.target.value }))} />
                <Input label="Button Link" value={hero.ctaLink} onChange={(event) => setHero((current) => ({ ...current, ctaLink: event.target.value }))} placeholder="/shop" />
                <Input label="Display Order" type="number" min="0" value={hero.order} onChange={(event) => setHero((current) => ({ ...current, order: event.target.value }))} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowHeroForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingHero}>Publish Hero Slide</Button>
              </div>
            </form>
          )}

          <div className="mt-6 overflow-hidden rounded-brand border border-sand/30">
            {isHeroLoading ? (
              <p className="p-4 text-xs text-taupe">Loading hero slides…</p>
            ) : heroSlides.length === 0 ? (
              <p className="p-4 text-xs text-taupe">No hero slides yet.</p>
            ) : (
              <div className="divide-y divide-sand/30">
                {heroSlides.map((slide) => (
                  <div key={slide._id} className="flex items-center gap-4 p-4">
                    {slide.image ? (
                      <img src={slide.image} alt="" className="h-14 w-20 rounded-brand object-cover" />
                    ) : (
                      <span className="flex h-14 w-20 items-center justify-center rounded-brand bg-cream text-wine">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-charcoal">{slide.title}</p>
                      <p className="mt-1 text-xs text-taupe">{slide.isActive ? 'Active' : 'Inactive'} · {slide.layout === 'split' ? 'Image beside text' : 'Text over image'} · Position {slide.order}</p>
                    </div>
                    <Button variant="ghost" size="sm" isLoading={deletingHeroId === slide._id} disabled={deletingHeroId !== null} onClick={() => handleDeleteHero(slide._id)} className="flex items-center gap-1 text-wine hover:text-burgundy" aria-label={`Delete ${slide.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-brand border border-sand/40 bg-white">
          <div className="border-b border-sand/30 px-5 py-4 sm:px-6">
            <h2 className="font-serif text-2xl text-charcoal">Your Products</h2>
          </div>
          {isLoading ? (
            <p className="p-6 text-xs text-taupe">Loading inventory…</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-xs text-taupe">No products yet. Add your first saree above.</p>
          ) : (
            <div className="divide-y divide-sand/30">
              {products.map((catalogProduct) => (
                <div key={catalogProduct._id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <img src={getProductFrontImage(catalogProduct.images)} alt="" className="h-16 w-12 rounded-brand object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal">{catalogProduct.title}</p>
                    <p className="mt-1 text-xs text-taupe">{catalogProduct.occasion} · {catalogProduct.fabric} · {catalogProduct.stock} in stock</p>
                  </div>
                  <p className="hidden text-sm font-semibold text-wine sm:block">{formatPrice(catalogProduct.discountPrice || catalogProduct.price)}</p>
                  <Button variant="ghost" size="sm" isLoading={deletingId === catalogProduct._id} disabled={deletingId !== null} onClick={() => handleDelete(catalogProduct._id)} className="flex items-center gap-1 text-wine hover:text-burgundy" aria-label={`Delete ${catalogProduct.title}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
