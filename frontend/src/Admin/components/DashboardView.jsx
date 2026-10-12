import React, { useState, useMemo } from 'react';
import { DollarSign, ShieldAlert, ShoppingBag, Users, TrendingUp, Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';

export const DashboardView = ({
  products,
  orders,
  customers,
  couponsCount,
  onNavigate,
  onSimulateSale,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // 1. CALCULATE KPIs
  const metrics = useMemo(() => {
    const totalSales = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid').length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    return {
      sales: Math.round(totalSales * 100) / 100,
      ordersCount: orders.length,
      customersCount: customers.length,
      alerts: lowStockCount + outOfStockCount,
      pendingOrders,
      lowStockCount,
    };
  }, [products, orders, customers]);

  // 2. DAILY SALES FOR GRAPH
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseSales = [840, 1120, 950, 1420, 1850, 2400, 2100];
    
    const baseSum = baseSales.reduce((a, b) => a + b, 0);
    const scale = metrics.sales > 0 ? metrics.sales / baseSum : 1;
    
    return days.map((day, idx) => ({
      label: day,
      value: Math.round(baseSales[idx] * scale * 100) / 100,
    }));
  }, [metrics.sales]);

  // 3. CATEGORY PERFORMANCE BREAKDOWN
  const categorySummary = useMemo(() => {
    const breakdown = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const cat = prod?.category || 'General';
          if (!breakdown[cat]) {
            breakdown[cat] = { total: 0, qty: 0 };
          }
          breakdown[cat].total += item.price * item.quantity;
          breakdown[cat].qty += item.quantity;
        });
      });

    return Object.entries(breakdown).map(([name, data]) => ({
      name,
      value: Math.round(data.total * 100) / 100,
      qty: data.qty,
    }));
  }, [orders, products]);

  // Max value in chart for scaling SVGs
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 100);

  // SVG dimensions for Revenue Trends Line Chart
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  // Compute SVG Points for the cubic line
  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = paddingX + (index * (svgWidth - paddingX * 2)) / (chartData.length - 1);
      const y = svgHeight - paddingY - (d.value / maxChartValue) * (svgHeight - paddingY * 2);
      return { x, y, label: d.label, value: d.value };
    });
  }, [chartData, maxChartValue]);

  // Generate cubic bezier curve command
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (pt.x - prev.x) / 3;
      const cpY2 = pt.y;
      return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  // Fill gradient path under line
  const fillPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${svgHeight - paddingY} L ${points[0]?.x || 0} ${svgHeight - paddingY} Z`;

  // Donut chart angle math
  const donutSlices = useMemo(() => {
    const total = categorySummary.reduce((sum, item) => sum + item.value, 0) || 1;
    let accumulatedAngle = 0;
    
    const colors = [
      'stroke-slate-900 dark:stroke-slate-100', // Women (Primary)
      'stroke-amber-600', // Men (Cognac/Tan leather looks)
      'stroke-emerald-600', // New Arrivals (Fresh emerald)
      'stroke-indigo-500', // Kids (Royal indigo)
    ];

    const fillAndTextColors = [
      'bg-slate-900',
      'bg-amber-600',
      'bg-emerald-600',
      'bg-indigo-500'
    ];

    return categorySummary.map((item, idx) => {
      const percentage = item.value / total;
      const strokeDash = accumulatedAngle;
      accumulatedAngle += percentage;
      return {
        ...item,
        percentage,
        strokeDashOffset: 100 - (percentage * 100),
        strokeDashOffsetCumulative: 100 - (strokeDash * 100),
        strokeDashArray: `${percentage * 100} ${100 - (percentage * 100)}`,
        colorClass: colors[idx % colors.length],
        bgClass: fillAndTextColors[idx % fillAndTextColors.length]
      };
    });
  }, [categorySummary]);

  // Critical items
  const criticalProducts = useMemo(() => {
    return products.filter((p) => p.stock <= 5).slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-tab-panel">
      {/* 1. HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="dashboard-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-dark flex items-center gap-2">
            Workspace Overview <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights and controls for your Shopify and Hyra garment listings.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSimulateSale}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg shadow-sm transition-all focus:outline-none"
            id="simulate-sale-btn"
            title="Create a gorgeous order and deduct stocks in real-time"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            Simulate Purchase
          </button>
          
          <button
            onClick={() => onNavigate('products')}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold rounded-lg shadow transition-all focus:outline-none"
          >
            Manage Garments
          </button>
        </div>
      </div>

      {/* 2. KPI GRID COMPONENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-grid">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between" id="kpi-card-sales">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 dark:bg-teal-950/20 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950 rounded-xl text-teal-600 dark:text-teal-400 relative z-10">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{metrics.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-bold mt-2">
                <TrendingUp className="w-3 h-3" />
                <span>+12.4% vs last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between" id="kpi-card-orders">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-950/20 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Dispatches</span>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950 rounded-xl text-amber-600 dark:text-amber-400 relative z-10">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.ordersCount}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                  {metrics.pendingOrders} Pending
                </span>
                <span>Active fulfillment</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between" id="kpi-card-customers">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-850 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fashion Members</span>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 relative z-10">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.customersCount}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                <span>+4 customer sign-ups today</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between" id="kpi-card-alerts">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform ${metrics.alerts > 0 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'}`}></div>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Status</span>
              <div className={`p-2.5 rounded-xl relative z-10 ${metrics.alerts > 0 ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-black tracking-tight ${metrics.alerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {metrics.alerts}
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold mt-2">
                {metrics.alerts > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400">Needs urgent restocking</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">All sizes in stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHART & INSIGHTS CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE TREND LINE CHART */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-2 flex flex-col justify-between relative" id="sales-trend-panel">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily transaction values for this week</p>
            </div>
            <span className="text-xs font-bold text-slate-400 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950">
              L7D
            </span>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            {/* Custom Interactive SVG Line Chart */}
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#d97706" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = paddingY + ratio * (svgHeight - paddingY * 2);
                return (
                  <line
                    key={index}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    className="stroke-slate-100 dark:stroke-slate-800/80"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Fill Area */}
              <path d={fillPath} fill="url(#areaGrad)" />

              {/* Line Curve */}
              <path
                d={linePath}
                fill="none"
                stroke="#d97706"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Data points */}
              {points.map((pt, index) => (
                <circle
                  key={index}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  className="fill-white stroke-amber-600 cursor-pointer transition-all duration-200"
                  strokeWidth="3"
                  onMouseEnter={(e) => {
                    setHoveredPoint({
                      x: pt.x,
                      y: pt.y - 12,
                      label: pt.label,
                      value: pt.value,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* X Axis Labels */}
              {points.map((pt, index) => (
                <text
                  key={index}
                  x={pt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 font-bold text-[10px]"
                >
                  {pt.label}
                </text>
              ))}

              {/* Y Axis Guides */}
              <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" className="fill-slate-400 font-bold text-[9px]">
                ₹{Math.round(maxChartValue).toLocaleString()}
              </text>
              <text x={paddingX - 8} y={svgHeight - paddingY + 3} textAnchor="end" className="fill-slate-400 font-bold text-[9px]">
                ₹0
              </text>
            </svg>

            {/* Simulated interactive tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-slate-900 border border-slate-800 text-white rounded px-2.5 py-1.5 shadow-xl text-[10px] font-mono z-50 pointer-events-none transform -translate-x-1/2"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100 - 15}%`,
                }}
              >
                <div className="font-sans text-slate-400 font-bold">{hoveredPoint.label}</div>
                <div className="text-amber-500 font-bold">${hoveredPoint.value.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* DONUT CATEGORY CHART */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="category-chart-panel">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Line Contribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Revenue weighted by apparel sections</p>
          </div>

          <div className="relative flex justify-center items-center my-6">
            {categorySummary.length === 0 ? (
              <div className="text-xs text-slate-400 font-medium py-12 text-center">No transactions recorded yet</div>
            ) : (
              <>
                <svg className="w-40 h-40 transform -rotate-90 overflow-visible" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(241,245,249,0.5)" strokeWidth="6" />
                  {donutSlices.map((slice, index) => (
                    <circle
                      key={index}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      className={`${slice.colorClass} cursor-pointer hover:stroke-width-7 transition-all duration-300`}
                      strokeWidth="5"
                      strokeDasharray={slice.strokeDashArray}
                      strokeDashoffset={slice.strokeDashOffsetCumulative}
                      onMouseEnter={() => setHoveredSlice(slice.name)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  ))}
                </svg>

                <div className="absolute text-center select-none pointer-events-none">
                  {hoveredSlice ? (
                    <>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{hoveredSlice}</span>
                      <span className="block text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                        ${donutSlices.find((s) => s.name === hoveredSlice)?.value.toLocaleString() || '0'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Share</span>
                      <span className="block text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        ${metrics.sales.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Slices legend */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-4 border-t border-slate-50 dark:border-slate-800">
            {donutSlices.map((slice, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${slice.bgClass}`} />
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{slice.name}</span>
                <span className="text-slate-400 dark:text-slate-500 ml-auto font-mono text-[10px]">
                  {Math.round(slice.percentage * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. UNDER-DESK WARNING PANEL & TOP SELLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* STOCK ALERTS PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="low-stock-panel">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Critical Inventory Alerts
              </h3>
              <button onClick={() => onNavigate('inventory')} className="text-xs text-rose-600 font-bold hover:underline">
                Open Inventory
              </button>
            </div>

            {criticalProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 font-bold">Excellent: All items are securely stocked.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3.5 border border-rose-100/50 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 rounded-xl hover:bg-rose-50/40 dark:hover:bg-rose-950/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || '/products/shirt.jpg'} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-100 dark:border-slate-800" alt="" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{p.sku} // Size options</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${p.stock === 0 ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'}`}>
                        {p.stock === 0 ? 'OUT OF STOCK' : `ONLY ${p.stock} LEFT`}
                      </span>
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">₹{p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOP SELLERS LIST */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="top-products-panel">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Hyra & Shopify Top Movers
            </h3>

            <div className="space-y-4">
              {products.slice(0, 3).map((p, idx) => (
                <div key={`${p.id || 'product'}-${idx}`} className="flex justify-between items-center p-2.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={p.images?.[0] || '/products/shirt.jpg'} className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shadow-sm" alt="" />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-bold text-[9px]">
                        {idx + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{p.category} // ₹{p.price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">100% Demand</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{p.stock} units avail</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
