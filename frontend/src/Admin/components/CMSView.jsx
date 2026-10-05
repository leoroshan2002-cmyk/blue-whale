import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Layout, ArrowRight, Sparkles } from 'lucide-react';

export const CMSView = ({
  sections,
  products,
  onUpdateCMS
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [editingSectionId, setEditingSectionId] = useState(null);

  // SECTION FIELD MUTATORS
  const handleToggleActive = (id) => {
    onUpdateCMS(
      sections.map(sec => sec.id === id ? { ...sec, isActive: !sec.isActive } : sec)
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const items = [...sections];
    // swap
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    onUpdateCMS(items);
  };

  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const items = [...sections];
    // swap
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    onUpdateCMS(items);
  };

  const handleFieldChange = (sectionId, field, value) => {
    onUpdateCMS(
      sections.map(sec => sec.id === sectionId ? { ...sec, [field]: value } : sec)
    );
  };

  return (
    <div className="space-y-6" id="cms-tab-panel">
      {/* CMS BANNER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">CMS / Storefront Layout Control</h2>
          <p className="text-xs text-slate-500 mt-1">Configure luxury landing sections, featured carousels, and order layout blocks.</p>
        </div>

        {/* View mode toggle */}
        <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all ${
              activeTab === 'editor'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Structure Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Live Store Mockup View
          </button>
        </div>
      </div>

      {/* WORKSPACE PREVIEWS IN DUAL LAYOUT FORM */}
      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"> 
          
          {/* CMS CHANNELS STACK (LG: COL-7) */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Drag-and-Drop / Action reordering columns:</span>
            
            {sections.map((sec, index) => {
              const isEditingThis = editingSectionId === sec.id;

              return (
                <div
                  key={`${sec.id || 'section'}-${index}`}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all ${
                    sec.isActive ? 'border-slate-150' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3.5">
                    {/* Title and Badge */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-950">
                        <Layout className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 block">{sec.type}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{sec.title || '(No Name Section)'}</h4>
                      </div>
                    </div>

                    {/* Up/down/visible action block */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 px-2 border rounded hover:bg-slate-50 disabled:opacity-30 dark:border-slate-800"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sections.length - 1}
                        className="p-1 px-2 border rounded hover:bg-slate-50 disabled:opacity-30 dark:border-slate-800"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                      </button>

                      <span className="w-px h-5 bg-slate-200 mx-1"></span>

                      <button
                        onClick={() => handleToggleActive(sec.id)}
                        className={`p-1.5 border rounded-lg hover:bg-slate-50 dark:border-slate-800 ${
                          sec.isActive ? 'text-teal-600' : 'text-slate-400'
                        }`}
                        title={sec.isActive ? 'Active on Storefront' : 'Hidden on Storefront'}
                      >
                        {sec.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setEditingSectionId(isEditingThis ? null : sec.id)}
                        className={`ml-1 px-2.5 py-1 font-bold text-[10.5px] border rounded ${
                          isEditingThis ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-55'
                        }`}
                      >
                        {isEditingThis ? 'Collapse' : 'Customize'}
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE CUSTOMISER FORMS PANEL */}
                  {isEditingThis && (
                    <div className="space-y-4 pt-1.5 animate-slide-up text-xs">
                      {/* Copy titles */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-black text-slate-400">Header Text Heading</label>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => handleFieldChange(sec.id, 'title', e.target.value)}
                            className="w-full border p-2 bg-slate-50 rounded dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                        {sec.type !== 'CategoryShowcase' && (
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-black text-slate-400">Subtitle Description</label>
                            <input
                              type="text"
                              value={sec.subtitle || ''}
                              onChange={(e) => handleFieldChange(sec.id, 'subtitle', e.target.value)}
                              className="w-full border p-2 bg-slate-50 rounded dark:bg-slate-950 dark:text-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* Backdrop image or banner link (if hero or promo) */}
                      {(sec.type === 'HeroBanner' || sec.type === 'PromoBanner') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-black text-slate-400">Background Backdrop Art Link</label>
                            <input
                              type="text"
                              value={sec.backgroundImage || ''}
                              onChange={(e) => handleFieldChange(sec.id, 'backgroundImage', e.target.value)}
                              className="w-full border p-2 bg-slate-50 rounded dark:bg-slate-950 dark:text-white font-mono text-[10px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-black text-slate-400">Action Button Text</label>
                              <input
                                  type="text"
                                  value={sec.buttonText || ''}
                                  onChange={(e) => handleFieldChange(sec.id, 'buttonText', e.target.value)}
                                  className="w-full border p-2 bg-slate-50 rounded dark:bg-slate-950 dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-black text-slate-400">Action Route LINK</label>
                              <input
                                  type="text"
                                  value={sec.buttonLink || ''}
                                  onChange={(e) => handleFieldChange(sec.id, 'buttonLink', e.target.value)}
                                  className="w-full border p-2 bg-slate-50 rounded dark:bg-slate-950 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Featured products mapping (if featured) */}
                      {sec.type === 'FeaturedProducts' && (
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-black text-slate-400 block">Spotlight Featured Garments (Max 3)</label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {products.slice(0, 6).map(prod => {
                              const list = sec.productIds || [];
                              const isSelected = list.includes(prod.id);

                              const toggleProductFeatured = () => {
                                let newList = [...list];
                                if (newList.includes(prod.id)) {
                                  newList = newList.filter(id => id !== prod.id);
                                } else if (newList.length < 3) {
                                  newList.push(prod.id);
                                } else {
                                  alert('Featured grids are optimized to fit max 3 apparel listings.');
                                  return;
                                };
                                handleFieldChange(sec.id, 'productIds', newList);
                              };

                              return (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={toggleProductFeatured}
                                  className={`flex items-center gap-2 p-1.5 border rounded-lg text-left transition-all ${
                                    isSelected ? 'border-amber-600 bg-amber-50/25' : 'border-slate-200'
                                  }`}
                                >
                                  <img src={prod.images[0]} className="w-8 h-10 object-cover rounded" alt="" />
                                  <div className="truncate">
                                    <h5 className="font-bold text-[10px] text-slate-800 truncate">{prod.name}</h5>
                                    <span className="text-[9px] text-slate-400 font-bold block">{prod.category}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* INTERACTIVE COMPACT SMARTPHONE MOCKUP ON RIGHT */}
          <div className="lg:col-span-5 relative" id="interactive-phone-previews-cms">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-4">Smartphone Real-time Render Mockup:</span>
            
            <div className="sticky top-6 border-[8px] border-slate-900 rounded-[30px] aspect-[9/18] overflow-hidden bg-white shadow-2xl flex flex-col justify-between max-w-[320px] mx-auto">
              
              {/* Speaker camera notch header */}
              <div className="bg-slate-900 h-6 w-full relative flex justify-between items-center px-4 self-start text-[8px] font-mono text-white/80 select-none z-30">
                <span>9:22 AM</span>
                <div className="bg-slate-950 h-3 w-16 rounded-full absolute left-1/2 top-1.5 -translate-x-1/2"></div>
                <span>100% [LTE]</span>
              </div>

              {/* Live Mock Website Body */}
              <div className="flex-grow overflow-y-auto no-scrollbar scroll-smooth">
                {/* Brand Navigation */}
                <div className="p-3 border-b text-center tracking-widest font-black text-slate-950 text-[11px] uppercase relative bg-white flex justify-between items-center z-10 sticky top-0 shadow-sm">
                  <span>HYRA HOME</span>
                </div>

                {/* Render active layout stack */}
                <div className="space-y-4">
                  {sections.filter(s => s.isActive).map((sec, index) => {
                    if (sec.type === 'HeroBanner') {
                      return (
                        <div key={`${sec.id || 'section'}-${index}`} className="relative aspect-[4/5] bg-slate-900 text-white flex items-end overflow-hidden">
                          <img src={sec.backgroundImage} className="w-full h-full object-cover absolute inset-0 opacity-80" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
                          <div className="relative p-4 text-left z-10 space-y-1">
                            <h5 className="font-black text-sm tracking-tight leading-tight uppercase">{sec.title}</h5>
                            <p className="text-[8.5px] text-slate-200 leading-normal line-clamp-2">{sec.subtitle}</p>
                            <button className="mt-2.5 px-3 py-1 bg-white text-slate-900 rounded font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                              {sec.buttonText} <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'CategoryShowcase') {
                      return (
                        <div key={`${sec.id || 'section'}-${index}`} className="p-3.5 space-y-2 text-left">
                          <h6 className="text-[9px] uppercase tracking-widest font-black text-slate-400">{sec.title}</h6>
                          <div className="grid grid-cols-3 gap-2">
                            {sec.categories?.map((c, i) => (
                              <div key={`${sec.id || 'section'}-category-${c.name || 'category'}-${i}`} className="relative rounded aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                                <img src={c.image} className="w-full h-full object-cover absolute inset-0 opacity-85" alt="" />
                                <div className="absolute inset-0 bg-slate-950/20"></div>
                                <span className="relative font-bold text-[9px] text-white uppercase">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'FeaturedProducts') {
                      return (
                        <div key={`${sec.id || 'section'}-${index}`} className="p-3.5 space-y-2.5 text-left bg-slate-50">
                          <div>
                            <h6 className="text-[9px] uppercase tracking-widest font-black text-slate-400">{sec.title}</h6>
                            <p className="text-[8px] text-slate-500 leading-tight block mt-0.5">{sec.subtitle}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {sec.productIds?.map((id, productIndex) => {
                              const pr = products.find(p => p.id === id);
                              if (!pr) return null;
                              return (
                                <div key={`${sec.id || 'section'}-product-${pr.id || id || 'product'}-${productIndex}`} className="space-y-1">
                                  <img src={pr.images[0]} className="w-full aspect-[4/5] object-cover rounded shadow-sm" alt="" />
                                  <h6 className="text-[8.5px] font-bold text-slate-900 truncate leading-tight">{pr.name}</h6>
                                  <span className="text-[8px] font-black text-slate-500 block">${pr.price}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'PromoBanner') {
                      return (
                        <div key={`${sec.id || 'section'}-${index}`} className="relative py-8 px-4 text-center text-white overflow-hidden bg-slate-950" style={{ backgroundImage: `url(${sec.backgroundImage})`, backgroundSize: 'cover' }}>
                           <div className="absolute inset-0 bg-slate-950/70"></div>
                           <div className="relative z-10 space-y-1.5 p-1">
                            <span className="text-[8px] font-bold text-amber-500 uppercase flex items-center gap-1 justify-center">
                              <Sparkles className="w-2.5 h-2.5" /> EXCLUSIVE SPECIAL OFFER
                            </span>
                            <h5 className="font-black text-xs uppercase leading-tight">{sec.title}</h5>
                            <p className="text-[8px] text-slate-350 leading-relaxed max-w-[200px] mx-auto">{sec.subtitle}</p>
                            <button className="px-3.5 py-1 text-[8.5px] font-black bg-amber-600 rounded text-white tracking-widest mx-auto mt-2">
                              {sec.buttonText}
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* iPhone bottom pill bar */}
              <div className="bg-white h-4 w-full flex justify-center items-center self-end pb-1.5 z-30">
                <div className="bg-slate-450 bg-slate-900 h-1 w-24 rounded-full"></div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* live preview separate view mode tab */
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <p className="text-xs text-slate-500 max-w-md text-center py-4">
             live mockup showing client storefront configuration. Toggle layouts or rearrange blocks to modify immediately.
          </p>
          {/* Large desktop simulated showcase */}
          <div className="border border-slate-200 rounded-xl w-full max-w-3xl overflow-hidden bg-slate-50 shadow-lg text-left">
            <div className="bg-slate-900 p-2 px-4 flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="bg-slate-800 rounded px-2.5 py-0.5 ml-4 text-[9px] w-64 truncate">https://www.hyra-premium-fashion.com</span>
            </div>
            
            <div className="bg-white text-slate-905 h-[500px] overflow-y-auto">
              <nav className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-50">
                <h1 className="text-md font-bold tracking-widest text-slate-950">HYRA MERCADO</h1>
                <div className="flex gap-4 text-[10px] font-black uppercase text-slate-500">
                  <span>New Drops</span>
                  <span>Men Collection</span>
                  <span>Women Dresses</span>
                  <span>Bag Accessories</span>
                </div>
              </nav>

              <div className="space-y-8">
                {sections.filter(s => s.isActive).map((sec) => {
                  if (sec.type === 'HeroBanner') {
                    return (
                      <div key={`${sec.id || 'section'}-${index}`} className="relative h-[280px] text-white flex items-end" style={{ backgroundImage: `url(${sec.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="absolute inset-0 bg-slate-950/40"></div>
                        <div className="p-8 relative z-10 max-w-lg space-y-2">
                          <h2 className="text-xl font-bold tracking-tight uppercase">{sec.title}</h2>
                          <p className="text-xs text-slate-100">{sec.subtitle}</p>
                          <button className="px-4 py-2 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded">
                            {sec.buttonText}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'CategoryShowcase') {
                    return (
                      <div key={`${sec.id || 'section'}-${index}`} className="p-8 space-y-4 max-w-4xl mx-auto">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 border-b pb-2 text-center">{sec.title}</h3>
                        <div className="grid grid-cols-3 gap-6">
                          {sec.categories?.map((c, i) => (
                            <div key={`${sec.id || 'section'}-category-${c.name || 'category'}-${i}`} className="relative rounded-xl overflow-hidden aspect-[4/5] bg-slate-100 flex items-end p-4">
                              <img src={c.image} className="w-full h-full object-cover absolute inset-0 hover:scale-105 transition-all duration-500" alt="" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                              <span className="relative font-bold text-xs text-white uppercase tracking-wider">{c.name} Collection</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'FeaturedProducts') {
                    return (
                      <div key={`${sec.id || 'section'}-${index}`} className="p-8 space-y-4 bg-slate-50">
                        <div className="text-center">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{sec.title}</h3>
                          <p className="text-[10px] text-slate-500 mt-1">{sec.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
                          {sec.productIds?.map((id, productIndex) => {
                            const pr = products.find(p => p.id === id);
                            if (!pr) return null;
                            return (
                              <div key={`${sec.id || 'section'}-product-${pr.id || id || 'product'}-${productIndex}`} className="space-y-1.5 bg-white border p-3 rounded-xl shadow-sm">
                                <img src={pr.images[0]} className="w-full aspect-[4/5] object-cover rounded-lg" alt="" />
                                <h4 className="text-xs font-bold text-slate-900 truncate">{pr.name}</h4>
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-slate-500 text-[10px] uppercase font-mono">{pr.sku}</span>
                                  <span className="text-slate-950">${pr.price}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'PromoBanner') {
                    return (
                      <div key={`${sec.id || 'section'}-${index}`} className="relative py-12 px-8 text-center text-white" style={{ backgroundImage: `url(${sec.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="absolute inset-0 bg-slate-950/70"></div>
                        <div className="relative z-10 max-w-xl mx-auto space-y-2">
                          <span className="text-[9px] uppercase tracking-widest font-black text-amber-500 flex items-center justify-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> PROMOTIONAL CAMPAIGN INTEL
                          </span>
                          <h3 className="text-lg font-bold uppercase">{sec.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{sec.subtitle}</p>
                          <button className="px-5 py-2 text-xs font-bold bg-amber-600 rounded mt-3">
                            {sec.buttonText}
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
