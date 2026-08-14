function AdminApp({ me, isSuper }) {
    const tabs = [
        { key: 'overview', label: 'Ringkasan', icon: '📊' },
        { key: 'approve', label: 'Persetujuan Stok', icon: '✅' },
        { key: 'deliveries', label: 'Pengantaran', icon: '🧊' },
        { key: 'invoiceCustomers', label: 'INVOICE PELANGGAN', icon: '🧾' },
        { key: 'reports', label: 'Laporan', icon: '📑' },
        { key: 'payments', label: 'Invoice', icon: '💳' },
        { key: 'users', label: 'Driver & Gudang', icon: '👥' },
        ...(!isSuper ? [{ key: 'companyData', label: 'INPUT DATA PERUSAHAAN', icon: '🏢' }] : []),
        ...(isSuper ? [{ key: 'requests', label: 'PERMINTAAN DATA', icon: '📨' }, { key: 'admins', label: 'Kelola Admin', icon: '🛡️' }, { key: 'settings', label: 'Perusahaan & Harga', icon: '⚙️' }] : [])
    ];
    const [a, setA] = useState('overview');
    return React.createElement(Shell, { user: me, tabs: tabs, active: a, setActive: setA, onLogout: () => { localStorage.removeItem('glasires_uid'); location.reload(); } },
        a === 'overview' && React.createElement(React.Fragment, null,
            React.createElement("h2", { className: "font-display font-bold text-xl mb-5" },
                "Ringkasan ",
                isSuper ? 'Super Admin' : 'Admin'),
            React.createElement(StockOverview, null),
            React.createElement(DeliveriesTable, null)),
        a === 'approve' && React.createElement(ApproveRequests, { me: me }),
        a === 'deliveries' && React.createElement(React.Fragment, null,
            React.createElement(StockOverview, null),
            React.createElement(DeliveriesTable, null)),
        a === 'invoiceCustomers' && React.createElement(InvoiceAdmin, { me: me }),
        a === 'reports' && (isSuper ? React.createElement(SuperReports, { me: me }) : React.createElement(Reports, { me: me })),
        a === 'payments' && React.createElement(PaymentManager, null),
        a === 'users' && React.createElement(ManageUsers, { me: me, roles: ['driver', 'gudang'], title: "Kelola Driver & Gudang" }),
        a === 'requests' && isSuper && React.createElement(SuperDataRequestMenu, { me: me }),
        a === 'companyData' && !isSuper && React.createElement(AdminCompanyData, { me: me }),
        a === 'admins' && isSuper && React.createElement(ManageUsers, { me: me, roles: ['admin'], title: "Kelola Admin" }),
        a === 'settings' && isSuper && React.createElement(CompanySettings, { me: me }));
}
function DriverOwnReport({ me }) {
    const ds = toList(useDbList('deliveries')).filter(d => d.driverId === me.id), invoiceBills = toList(useDbList('invoiceCustomers')).filter(b => b.collectorId === me.id && b.approvalStatus === 'approved'), cfg = useDbValue('config/company', {}), [period, setPeriod] = useState('day'), [date, setDate] = useState(tanggalLokal()), [toast, show] = useToast();
    const start = new Date(date + 'T00:00:00');
    let end = new Date(start);
    if (period === 'day') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (period === 'month') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    else {
        start.setMonth(0, 0);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    const rows = ds.filter(d => d.timestamp >= start.getTime() && d.timestamp <= end.getTime()).sort((a, b) => b.timestamp - a.timestamp), invoiceRows = invoiceBills.filter(b => { const t = +((b.assignedAt || b.createdAt) || 0); return t >= start.getTime() && t <= end.getTime(); }).sort((a, b) => (b.assignedAt || b.createdAt || 0) - (a.assignedAt || a.createdAt || 0));
    const directCash = rows.filter(d => d.paymentMethod === 'cash').reduce((a, d) => a + (+d.total || 0), 0), waitTotal = rows.filter(d => d.paymentMethod === 'wait_cash').reduce((a, d) => a + (+d.total || 0), 0), waitPaid = rows.filter(d => d.paymentMethod === 'wait_cash' && d.paymentStatus === 'paid').reduce((a, d) => a + (+d.total || 0), 0), waitUnpaid = Math.max(0, waitTotal - waitPaid), taskInvoiceUnpaid = invoiceRows.filter(b => b.status !== 'paid').reduce((a, b) => a + (+b.total || 0), 0), taskInvoicePaid = invoiceRows.filter(b => b.status === 'paid').reduce((a, b) => a + (+b.total || 0), 0), cash = directCash, waitCash = waitUnpaid, paymentToAdmin = cash + waitPaid + taskInvoicePaid, qty = rows.reduce((a, d) => a + (+d.qty || 0), 0), total = rows.reduce((a, d) => a + (+d.total || 0), 0), pct = (v, t) => t ? Math.round(v / t * 100) : 0;
    const print = () => window.print(), pdf = () => { try {
        const { jsPDF } = window.jspdf, p = new jsPDF();
        p.setFont('helvetica', 'bold');
        p.setFontSize(17);
        p.text(cfg.name || 'GlasirEs', 15, 17);
        p.setFontSize(10);
        p.setFont('helvetica', 'normal');
        p.text(cfg.address || '', 15, 24);
        p.text(cfg.phone || '', 15, 30);
        p.setFont('helvetica', 'bold');
        p.setFontSize(14);
        p.text('LAPORAN DRIVER', 15, 42);
        p.setFont('helvetica', 'normal');
        p.setFontSize(9);
        p.text(`Driver: ${me.name}`, 15, 48);
        p.text(`Periode: ${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`, 15, 54);
        p.text(`CASH: ${rupiah(cash)} | WAIT CASH LUNAS: ${rupiah(waitPaid)}`, 15, 63);
        p.text(`TUGAS INVOICE BELUM LUNAS: ${rupiah(taskInvoiceUnpaid)} | TUGAS INVOICE LUNAS: ${rupiah(taskInvoicePaid)}`, 15, 69);
        p.text(`TOTAL PAYMENT TO ADMIN: ${rupiah(paymentToAdmin)}`, 15, 75);
        let y = 90;
        p.setFontSize(8);
        rows.slice(0, 28).forEach((d, i) => { p.text(`${i + 1}. ${new Date(d.timestamp).toLocaleDateString('id-ID')} | Pelanggan: ${String(d.customerName || '-')} | Lokasi: ${String(d.location || '-')} | ${d.qty} | ${rupiah(d.total)} | ${d.paymentMethod}`, 15, y); y += 6; if (y > 285) {
            p.addPage();
            y = 18;
        } });
        p.save(`laporan-driver-${me.username}-${period}.pdf`);
    }
    catch (e) {
        show('PDF gagal: ' + e.message, 'err');
    } };
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("div", { className: "no-print" },
            React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-3 mb-5" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "font-display font-bold text-xl" }, "\uD83D\uDCD1 Laporan Saya"),
                    React.createElement("p", { className: "text-sm text-slate-500" },
                        "Laporan khusus ",
                        React.createElement("b", null, me.name),
                        ".")),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(Btn, { tone: "accent", onClick: print }, "\uD83D\uDDA8 Print"),
                    React.createElement(Btn, { tone: "ghost", onClick: pdf }, "PDF"))),
            React.createElement(Card, { className: "mb-5" },
                React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" },
                    React.createElement(Field, { label: "Periode" },
                        React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                            React.createElement("option", { value: "day" }, "Harian"),
                            React.createElement("option", { value: "month" }, "Bulanan"),
                            React.createElement("option", { value: "year" }, "Tahunan"))),
                    React.createElement(Field, { label: "Tanggal Acuan" },
                        React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) }))))),
        React.createElement("div", { className: "report-page report-print-area driver-report-print-area", style: { '--report-color': cfg.reportColor || '#1c4a73' } },
            React.createElement("div", { className: "report-head" },
                cfg.logo && React.createElement("img", { className: "report-logo", src: cfg.logo }),
                React.createElement("div", null,
                    React.createElement("div", { className: "report-title text-2xl font-bold" }, cfg.name || 'GlasirEs'),
                    React.createElement("div", { className: "text-sm" }, cfg.address || ''),
                    React.createElement("div", { className: "text-sm" }, cfg.phone || ''))),
            React.createElement("div", { className: "mt-6" },
                React.createElement("h1", { className: "text-2xl font-display font-bold" }, "LAPORAN KINERJA DRIVER"),
                React.createElement("p", { className: "text-sm" },
                    "Driver: ",
                    React.createElement("b", null, me.name),
                    " \u00B7 Periode: ",
                    start.toLocaleDateString('id-ID'),
                    " s/d ",
                    end.toLocaleDateString('id-ID'))),
            React.createElement("div", { className: "grid md:grid-cols-8 gap-3 my-5 driver-report-hide-print" },
                React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border" },
                    React.createElement("small", null, "TRANSAKSI"),
                    React.createElement("b", { className: "block text-2xl" }, rows.length)),
                React.createElement("div", { className: "p-4 rounded-2xl bg-cyan-50 border" },
                    React.createElement("small", null, "KANTONG"),
                    React.createElement("b", { className: "block text-2xl" }, qty)),
                React.createElement("div", { className: "p-4 rounded-2xl bg-green-50 border" },
                    React.createElement("small", null, "CASH"),
                    React.createElement("b", { className: "block text-lg" }, rupiah(cash))),
                React.createElement("div", { className: "p-4 rounded-2xl bg-amber-50 border" },
                    React.createElement("small", null, "WAIT CASH"),
                    React.createElement("b", { className: "block text-lg text-amber-700" }, rupiah(waitCash)),
                    React.createElement("span", { className: "text-xs" }, "Belum lunas")),
                React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                    React.createElement("small", null, "WAIT CASH LUNAS"),
                    React.createElement("b", { className: "block text-lg text-emerald-700" }, rupiah(waitPaid))),
                React.createElement("div", { className: "p-4 rounded-2xl bg-amber-50 border" },
                    React.createElement("small", null, "TUGAS INVOICE BELUM LUNAS"),
                    React.createElement("b", { className: "block text-lg text-amber-700" }, rupiah(taskInvoiceUnpaid))),
                React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                    React.createElement("small", null, "TUGAS INVOICE LUNAS"),
                    React.createElement("b", { className: "block text-lg text-emerald-700" }, rupiah(taskInvoicePaid))),
                React.createElement("div", { className: "p-4 rounded-2xl bg-glacier-900 text-white" },
                    React.createElement("small", { className: "text-frost-200" }, "TOTAL PAYMENT TO ADMIN"),
                    React.createElement("b", { className: "block text-lg" }, rupiah(paymentToAdmin)))),
            React.createElement(Card, { className: "mb-5" },
                React.createElement("h3", { className: "font-bold mb-4" }, "Detail Pengantaran Saya"),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", { className: "py-2" }, "No"),
                                React.createElement("th", null, "Tanggal & Jam"),
                                React.createElement("th", null, "Pelanggan"),
                                React.createElement("th", null, "Lokasi"),
                                React.createElement("th", null, "Produk"),
                                React.createElement("th", null, "Kantong"),
                                React.createElement("th", null, "Total"),
                                React.createElement("th", null, "Pembayaran"))),
                        React.createElement("tbody", null, rows.map((d, i) => React.createElement("tr", { key: d.id, className: "border-b" },
                            React.createElement("td", { className: "py-2" }, i + 1),
                            React.createElement("td", null, waktu(d.timestamp)),
                            React.createElement("td", { className: "full-customer-location", title: String(d.customerNameFull || d.customerName || '') }, String(d.customerNameFull || d.customerName || '')),
                            React.createElement("td", { className: "full-customer-location", title: String(d.locationFull || d.location || '-') }, String(d.locationFull || d.location || '-')),
                            React.createElement("td", null, d.productName || d.productType || d.product || '-'),
                            React.createElement("td", null, d.qty),
                            React.createElement("td", null, rupiah(d.total)),
                            React.createElement("td", null, d.paymentMethod === 'invoice' ? React.createElement(React.Fragment, null,
                                React.createElement("b", null, rupiah(d.total)),
                                " \u00B7 INVOICE \u00B7 ",
                                d.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS') : d.paymentMethod === 'wait_cash' ? `WAIT CASH · ${d.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}` : 'CASH'))))))),
            React.createElement(Card, null,
                React.createElement("h3", { className: "font-bold mb-4" }, "Tugas Invoice Saya"),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", { className: "py-2" }, "No"),
                                React.createElement("th", null, "Invoice"),
                                React.createElement("th", null, "Pelanggan"),
                                React.createElement("th", null, "Nilai Tugas Invoice"),
                                React.createElement("th", null, "Status"))),
                        React.createElement("tbody", null,
                            invoiceRows.map((b, i) => React.createElement("tr", { key: b.id, className: "border-b" },
                                React.createElement("td", { className: "py-2" }, i + 1),
                                React.createElement("td", null, b.invoiceNo),
                                React.createElement("td", null, b.customerName),
                                React.createElement("td", null,
                                    React.createElement("b", null, rupiah(b.total))),
                                React.createElement("td", null, b.status === 'paid' ? React.createElement(Pill, { tone: "done" }, "INVOICE LUNAS") : React.createElement(Pill, { tone: "pending" }, "INVOICE BELUM LUNAS")))),
                            !invoiceRows.length && React.createElement("tr", null,
                                React.createElement("td", { colSpan: "5", className: "text-center py-6 text-slate-400" }, "Belum ada tugas invoice pada periode ini."))))),
                React.createElement("div", { className: "mt-5 text-right" },
                    React.createElement("b", null,
                        "Tugas Invoice Belum Lunas: ",
                        rupiah(taskInvoiceUnpaid)),
                    React.createElement("br", null),
                    React.createElement("b", null,
                        "Total Tugas Invoice Lunas: ",
                        rupiah(taskInvoicePaid)),
                    React.createElement("br", null),
                    React.createElement("b", { className: "text-lg" },
                        "TOTAL PAYMENT TO ADMIN: ",
                        rupiah(paymentToAdmin)))),
            React.createElement("div", { className: "sig" },
                React.createElement("div", null,
                    "Mengetahui,",
                    React.createElement("div", { className: "sigline" }),
                    React.createElement("b", null, cfg.name || 'Perusahaan')),
                React.createElement("div", null,
                    "Dibuat oleh,",
                    React.createElement("div", { className: "sigline" }),
                    React.createElement("b", null, me.name),
                    React.createElement("div", { className: "text-xs" }, "Driver")))));
}
function WarehouseProductBreakdown({ startTs, endTs, includeAll = true }) {
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')), stockByProduct = useDbList('warehouse/stockByProduct'), wh = toList(useDbList('warehouse/history')), rr = toList(useDbList('returnRequests'));
    const inRange = t => { const n = Number(t || 0); return n >= startTs && n <= endTs; };
    const data = products.map(p => {
        const h = wh.filter(x => x.productId === p.id && inRange(x.timestamp));
        const ret = rr.filter(x => x.productId === p.id && x.status === 'approved' && inRange(x.receivedAt || x.requestedAt));
        const masuk = h.filter(x => x.type === 'masuk').reduce((a, x) => a + (+x.qty || 0), 0);
        const keluar = h.filter(x => x.type === 'keluar').reduce((a, x) => a + (+x.qty || 0), 0);
        const kembali = h.filter(x => x.type === 'kembali').reduce((a, x) => a + (+x.qty || 0), 0);
        return { p, stock: Number(stockByProduct[p.id] || 0), masuk, keluar, kembali };
    }).filter(x => includeAll || x.stock || x.masuk || x.keluar || x.kembali);
    const max = Math.max(1, ...data.map(x => x.stock));
    return React.createElement(Card, { className: "mt-5" },
        React.createElement("div", { className: "flex justify-between items-center gap-3 mb-4" },
            React.createElement("div", null,
                React.createElement("h3", { className: "font-bold" }, "\uD83D\uDCE6 Stok & Aktivitas Berdasarkan Jenis Produk"),
                React.createElement("div", { className: "text-xs text-slate-500" }, "Stok saat ini, masuk, keluar, dan kembalian untuk setiap jenis produk.")),
            React.createElement(Pill, null,
                data.length,
                " produk")),
        React.createElement("div", { className: "space-y-4" },
            data.map(x => React.createElement("div", { key: x.p.id, className: "p-4 rounded-2xl border bg-white/70" },
                React.createElement("div", { className: "flex justify-between gap-3" },
                    React.createElement("b", null, x.p.name),
                    React.createElement("b", null,
                        x.stock.toLocaleString('id-ID'),
                        " kantong")),
                React.createElement("div", { className: "h-3 bg-slate-100 rounded-full overflow-hidden mt-2" },
                    React.createElement("div", { className: "h-full bg-gradient-to-r from-cyan-400 to-sky-600", style: { width: `${Math.max(x.stock ? 3 : 0, Math.round(x.stock / max * 100))}%` } })),
                React.createElement("div", { className: "grid grid-cols-3 gap-2 mt-3 text-xs" },
                    React.createElement("div", null,
                        "\uD83D\uDFE2 Masuk",
                        React.createElement("br", null),
                        React.createElement("b", null, x.masuk),
                        " kantong"),
                    React.createElement("div", null,
                        "\uD83D\uDD34 Keluar",
                        React.createElement("br", null),
                        React.createElement("b", null, x.keluar),
                        " kantong"),
                    React.createElement("div", null,
                        "\uD83D\uDFE3 Kembali",
                        React.createElement("br", null),
                        React.createElement("b", null, x.kembali),
                        " kantong")))),
            !data.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada data jenis produk pada periode ini.")),
        React.createElement("div", { className: "overflow-x-auto mt-5" },
            React.createElement("table", { className: "w-full text-sm report-table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "JENIS PRODUK"),
                        React.createElement("th", null, "STOK SAAT INI"),
                        React.createElement("th", null, "MASUK"),
                        React.createElement("th", null, "KELUAR"),
                        React.createElement("th", null, "KEMBALI"))),
                React.createElement("tbody", null, data.map(x => React.createElement("tr", { key: 't' + x.p.id },
                    React.createElement("td", null, x.p.name),
                    React.createElement("td", null, x.stock),
                    React.createElement("td", null, x.masuk),
                    React.createElement("td", null, x.keluar),
                    React.createElement("td", null, x.kembali)))))));
}
function GudangOwnReport({ me }) {
    const wh = toList(useDbList('warehouse/history')).filter(x => x.by === me.id), returns = toList(useDbList('returnRequests')).filter(x => x.receivedBy === me.id && (x.status === 'received' || x.status === 'approved')), cfg = useDbValue('config/company', {}), stock = useDbValue('warehouse/stock', 0), [period, setPeriod] = useState('day'), [date, setDate] = useState(new Date().toISOString().slice(0, 10)), [toast, show] = useToast();
    const start = new Date(date + 'T00:00:00');
    let end = new Date(start);
    if (period === 'day') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (period === 'month') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    else {
        start.setMonth(0, 0);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    const rows = wh.filter(x => x.timestamp >= start.getTime() && x.timestamp <= end.getTime() && x.type !== 'kembali').sort((a, b) => b.timestamp - a.timestamp);
    const ret = returns.filter(x => (x.receivedAt || 0) >= start.getTime() && (x.receivedAt || 0) <= end.getTime());
    const masuk = rows.filter(x => x.type === 'masuk').reduce((a, x) => a + (+x.qty || 0), 0);
    const keluar = rows.filter(x => x.type === 'keluar').reduce((a, x) => a + (+x.qty || 0), 0);
    const kembali = ret.reduce((a, x) => a + (+x.qty || 0), 0);
    const pct = (v, t) => t ? Math.round(v / t * 100) : 0;
    const print = () => window.print();
    const pdf = () => { try {
        const { jsPDF } = window.jspdf, p = new jsPDF();
        p.setFont('helvetica', 'bold');
        p.setFontSize(17);
        p.text(cfg.name || 'GlasirEs', 15, 17);
        p.setFontSize(10);
        p.setFont('helvetica', 'normal');
        p.text(cfg.address || '', 15, 24);
        p.text(cfg.phone || '', 15, 30);
        p.setFont('helvetica', 'bold');
        p.setFontSize(14);
        p.text('LAPORAN GUDANG', 15, 42);
        p.setFont('helvetica', 'normal');
        p.setFontSize(9);
        p.text(`Petugas: ${me.name}`, 15, 48);
        p.text(`Periode: ${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`, 15, 54);
        p.text(`Stok saat ini: ${stock} kantong`, 15, 63);
        p.text(`Masuk: ${masuk} kantong (${pct(masuk, masuk + keluar)}%)`, 15, 69);
        p.text(`Keluar: ${keluar} kantong (${pct(keluar, masuk + keluar)}%)`, 15, 75);
        p.text(`Kembali diterima: ${kembali} kantong`, 15, 81);
        let y = 92;
        p.setFontSize(8);
        rows.slice(0, 35).forEach((x, i) => { p.text(`${i + 1}. ${new Date(x.timestamp).toLocaleDateString('id-ID')} | ${x.type.toUpperCase()} | ${x.qty} | ${x.byName || x.driverName || '-'}`, 15, y); y += 6; if (y > 285) {
            p.addPage();
            y = 18;
        } });
        p.save(`laporan-gudang-${me.username}-${period}.pdf`);
    }
    catch (e) {
        show('PDF gagal: ' + e.message, 'err');
    } };
    const dough = (a, b, c) => { const t = (+a || 0) + (+b || 0) + (+c || 0) || 1, pa = (+a || 0) / t * 100, pb = ((+a || 0) + (+b || 0)) / t * 100; return { background: `conic-gradient(#22c55e 0 ${pa}%, #ef4444 ${pa}% ${pb}%, #8b5cf6 ${pb}% 100%)` }; };
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("div", { className: "no-print" },
            React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-3 mb-5" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "font-display font-bold text-xl" }, "\uD83D\uDCE6 Laporan Gudang Saya"),
                    React.createElement("p", { className: "text-sm text-slate-500" },
                        "Laporan khusus ",
                        React.createElement("b", null, me.name),
                        ". Hanya aktivitas gudang yang dilakukan akun ini."))),
            React.createElement(Card, { className: "mb-5" },
                React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" },
                    React.createElement(Field, { label: "Periode" },
                        React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                            React.createElement("option", { value: "day" }, "Harian"),
                            React.createElement("option", { value: "month" }, "Bulanan"),
                            React.createElement("option", { value: "year" }, "Tahunan"))),
                    React.createElement(Field, { label: "Tanggal Acuan" },
                        React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) }))))),
        React.createElement("div", { className: "report-page report-print-area", style: { '--report-color': cfg.reportColor || '#1c4a73' } },
            React.createElement("div", { className: "report-head" },
                cfg.logo && React.createElement("img", { className: "report-logo", src: cfg.logo }),
                React.createElement("div", null,
                    React.createElement("div", { className: "report-title text-2xl font-bold" }, cfg.name || 'GlasirEs'),
                    React.createElement("div", { className: "text-sm" }, cfg.address || ''),
                    React.createElement("div", { className: "text-sm" }, cfg.phone || ''))),
            React.createElement("div", { className: "mt-6 flex justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-2xl font-display font-bold" }, "LAPORAN AKTIVITAS GUDANG"),
                    React.createElement("p", { className: "text-sm" },
                        "Petugas: ",
                        React.createElement("b", null, me.name),
                        " \u00B7 @",
                        me.username),
                    React.createElement("p", { className: "text-sm" },
                        "Periode: ",
                        start.toLocaleDateString('id-ID'),
                        " s/d ",
                        end.toLocaleDateString('id-ID'))),
                React.createElement("div", { className: "text-right text-xs text-slate-500" },
                    "Khusus akun gudang ini",
                    React.createElement("br", null),
                    "Tidak menampilkan gudang/user lain")),
            React.createElement("div", { className: "grid md:grid-cols-4 gap-3 my-5" },
                React.createElement("div", { className: "p-4 rounded-2xl bg-cyan-50 border" },
                    React.createElement("small", null, "STOK SAAT INI"),
                    React.createElement("b", { className: "block text-2xl text-cyan-700" }, stock),
                    React.createElement("span", { className: "text-xs" }, "kantong")),
                React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                    React.createElement("small", null, "MASUK"),
                    React.createElement("b", { className: "block text-2xl text-emerald-700" }, masuk),
                    React.createElement("span", { className: "text-xs" },
                        pct(masuk, masuk + keluar),
                        "%")),
                React.createElement("div", { className: "p-4 rounded-2xl bg-rose-50 border" },
                    React.createElement("small", null, "KELUAR"),
                    React.createElement("b", { className: "block text-2xl text-rose-700" }, keluar),
                    React.createElement("span", { className: "text-xs" },
                        pct(keluar, masuk + keluar),
                        "%")),
                React.createElement("div", { className: "p-4 rounded-2xl bg-violet-50 border" },
                    React.createElement("small", null, "KEMBALI DITERIMA"),
                    React.createElement("b", { className: "block text-2xl text-violet-700" }, kembali),
                    React.createElement("span", { className: "text-xs" }, "kantong"))),
            React.createElement("div", { className: "grid md:grid-cols-2 gap-5 mb-5" },
                React.createElement(Card, null,
                    React.createElement("h3", { className: "font-bold mb-4" }, "Diagram Masuk vs Keluar"),
                    React.createElement("div", { className: "flex items-center gap-6" },
                        React.createElement("div", { className: "w-40 h-40 rounded-full relative", style: dough(masuk, keluar, kembali) },
                            React.createElement("div", { className: "absolute inset-5 bg-white rounded-full flex items-center justify-center text-xs text-center font-bold" },
                                masuk + keluar,
                                React.createElement("br", null),
                                "aktivitas")),
                        React.createElement("div", { className: "text-sm space-y-3" },
                            React.createElement("div", null,
                                "\uD83D\uDFE2 MASUK ",
                                React.createElement("b", null,
                                    pct(masuk, masuk + keluar + kembali),
                                    "%"),
                                React.createElement("br", null),
                                React.createElement("span", { className: "ml-5" },
                                    masuk,
                                    " kantong")),
                            React.createElement("div", null,
                                "\uD83D\uDD34 KELUAR ",
                                React.createElement("b", null,
                                    pct(keluar, masuk + keluar + kembali),
                                    "%"),
                                React.createElement("br", null),
                                React.createElement("span", { className: "ml-5" },
                                    keluar,
                                    " kantong")),
                            React.createElement("div", null,
                                "\uD83D\uDFE3 KEMBALI ",
                                React.createElement("b", null,
                                    pct(kembali, masuk + keluar + kembali),
                                    "%"),
                                React.createElement("br", null),
                                React.createElement("span", { className: "ml-5" },
                                    kembali,
                                    " kantong"))))),
                React.createElement(Card, null,
                    React.createElement("h3", { className: "font-bold mb-4" }, "Ringkasan Periode"),
                    React.createElement("div", { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between border-b pb-2" },
                            React.createElement("span", null, "Stok saat ini"),
                            React.createElement("b", null,
                                stock,
                                " kantong")),
                        React.createElement("div", { className: "flex justify-between border-b pb-2" },
                            React.createElement("span", null, "Masuk periode ini"),
                            React.createElement("b", { className: "text-emerald-600" },
                                masuk,
                                " kantong")),
                        React.createElement("div", { className: "flex justify-between border-b pb-2" },
                            React.createElement("span", null, "Keluar periode ini"),
                            React.createElement("b", { className: "text-rose-600" },
                                keluar,
                                " kantong")),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", null, "Kembali diterima"),
                            React.createElement("b", null,
                                kembali,
                                " kantong"))))),
            React.createElement(Card, null,
                React.createElement("h3", { className: "font-bold mb-4" }, "Detail Aktivitas Gudang Saya"),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", { className: "py-2" }, "No"),
                                React.createElement("th", null, "Tanggal"),
                                React.createElement("th", null, "Jenis"),
                                React.createElement("th", null, "Jenis Produk"),
                                React.createElement("th", null, "Jumlah"),
                                React.createElement("th", null, "Driver / Keterangan"))),
                        React.createElement("tbody", null,
                            rows.map((x, i) => React.createElement("tr", { key: x.id, className: "border-b" },
                                React.createElement("td", { className: "py-2" }, i + 1),
                                React.createElement("td", null, new Date(x.timestamp).toLocaleDateString('id-ID')),
                                React.createElement("td", null, x.type === 'masuk' ? '🟢 MASUK' : x.type === 'keluar' ? '🔴 KELUAR' : '🟣 KEMBALI'),
                                React.createElement("td", null, x.productName || 'Es Kristal'),
                                React.createElement("td", null,
                                    x.qty,
                                    " kantong"),
                                React.createElement("td", null, x.driverName || x.note || '-'))),
                            ret.map((x, i) => React.createElement("tr", { key: 'r' + x.id, className: "border-b" },
                                React.createElement("td", { className: "py-2" }, rows.length + i + 1),
                                React.createElement("td", null, new Date(x.receivedAt).toLocaleDateString('id-ID')),
                                React.createElement("td", null, "\uD83D\uDFE3 KEMBALI"),
                                React.createElement("td", null, x.productName || 'Es Kristal'),
                                React.createElement("td", null,
                                    x.qty,
                                    " kantong"),
                                React.createElement("td", null, x.driverName || '-'))),
                            !rows.length && !ret.length && React.createElement("tr", null,
                                React.createElement("td", { colSpan: "6", className: "py-8 text-center text-slate-400" }, "Belum ada aktivitas pada periode ini.")))))),
            "\\n   ",
            React.createElement(WarehouseProductBreakdown, { startTs: start.getTime(), endTs: end.getTime(), includeAll: true }),
            React.createElement("div", { className: "sig" },
                React.createElement("div", null,
                    "Mengetahui,",
                    React.createElement("div", { className: "sigline" }),
                    React.createElement("b", null, cfg.name || 'Perusahaan')),
                React.createElement("div", null,
                    "Dibuat oleh,",
                    React.createElement("div", { className: "sigline" }),
                    React.createElement("b", null, me.name),
                    React.createElement("div", { className: "text-xs" }, "Gudang"))),
            React.createElement("div", { className: "text-center text-[10px] text-slate-400 mt-8" }, "Power by Syech B@-it \u00B7 Copyright \u00A9 2026")));
}
function DriverRequest({ me }) {
    const rs = toList(useDbList('stockRequests')).filter(r => r.driverId === me.id).sort((a, b) => (b.requestedForDate || '').localeCompare(a.requestedForDate || '') || (b.requestedAt - a.requestedAt)), products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')), [productId, setProductId] = useState(''), [q, setQ] = useState(''), [neededDate, setNeededDate] = useState(tanggalLokal()), [period, setPeriod] = useState('all'), [periodDate, setPeriodDate] = useState(tanggalLokal()), [toast, show] = useToast();
    const filteredRs = rs.filter(r => driverPeriodMatch(r.requestedAt, period, periodDate));
    const send = async () => {
        const n = +q, product = products.find(p => p.id === productId);
        if (!productId || !product)
            return show('Pilih jenis produk terlebih dahulu.', 'err');
        if (n < 1)
            return show('Jumlah tidak valid.', 'err');
        if (!neededDate)
            return show('Tanggal kebutuhan wajib dipilih.', 'err');
        const r = await db.ref('stockRequests').push({ driverId: me.id, driverName: me.name, productId, productName: product.name, qtyRequested: n, requestedForDate: neededDate, status: 'pending', requestedAt: Date.now() });
        const tgl = new Date(neededDate + 'T00:00:00').toLocaleDateString('id-ID');
        await notify({ title: 'Permintaan stok baru', message: `${me.name} meminta ${n} kantong ${product.name} untuk tanggal ${tgl}. Status: MENUNGGU ACC ADMIN.`, toRole: 'admin', fromUser: me.id, data: { requestId: r.key, requestedForDate: neededDate, productId }, menu: 'approve' });
        await notify({ title: 'Permintaan stok baru', message: `${me.name} meminta ${n} kantong ${product.name} untuk tanggal ${tgl}. Status: MENUNGGU ACC ADMIN.`, toRole: 'superadmin', fromUser: me.id, data: { requestId: r.key, requestedForDate: neededDate, productId }, menu: 'approve' });
        setProductId('');
        setQ('');
        show('Permintaan dikirim ke Admin. Status: MENUNGGU ACC ADMIN.');
    };
    const statusLabel = r => r.status === 'pending' ? 'MENUNGGU ACC ADMIN' : r.status === 'admin_approved' ? 'SUDAH DI-ACC ADMIN · MENUNGGU GUDANG' : r.status === 'fulfilled' ? 'APPROVE ADMIN + GUDANG · SELESAI' : r.status === 'rejected' ? 'DITOLAK' : 'SELESAI';
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Minta Stok Es"),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" },
                React.createElement(Field, { label: "Jenis Produk" },
                    React.createElement("select", { className: inputCls, value: productId, onChange: e => setProductId(e.target.value) },
                        React.createElement("option", { value: "" }, "Pilih jenis produk"),
                        products.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name)))),
                React.createElement(Field, { label: "Tanggal Dibutuhkan" },
                    React.createElement("input", { type: "date", min: tanggalLokal(), className: inputCls, value: neededDate, onChange: e => setNeededDate(e.target.value) })),
                React.createElement(Field, { label: "Jumlah Kantong" },
                    React.createElement("input", { type: "number", min: "1", className: inputCls, value: q, onChange: e => setQ(e.target.value) }))),
            React.createElement(Btn, { tone: "accent", onClick: send }, "Kirim Permintaan")),
        React.createElement(Card, null,
            React.createElement("b", null, "Riwayat Permintaan"),
            React.createElement(DriverHistoryFilter, { period: period, setPeriod: setPeriod, date: periodDate, setDate: setPeriodDate }),
            React.createElement("div", { className: "mt-4 space-y-2" },
                filteredRs.map(r => React.createElement("div", { key: r.id, className: "p-4 rounded-xl border" },
                    React.createElement("div", { className: "flex justify-between gap-3" },
                        React.createElement("span", null,
                            React.createElement("b", null,
                                r.productName || 'Es Kristal',
                                " \u00B7 ",
                                r.qtyRequested,
                                " kantong"),
                            React.createElement("br", null),
                            React.createElement("small", null,
                                "Dibutuhkan: ",
                                r.requestedForDate ? new Date(r.requestedForDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'),
                            React.createElement("br", null),
                            React.createElement("small", null,
                                "Diminta: ",
                                waktu(r.requestedAt))),
                        React.createElement(Pill, { tone: r.status === 'pending' ? 'pending' : r.status === 'rejected' ? 'rejected' : r.status === 'fulfilled' ? 'done' : 'approved' }, statusLabel(r))),
                    r.status === 'admin_approved' && React.createElement("div", { className: "text-xs text-amber-700 mt-2" }, "\u2713 Sudah di-ACC Admin \u00B7 menunggu pengeluaran / APPROVE Gudang."),
                    r.status === 'fulfilled' && React.createElement("div", { className: "text-xs text-emerald-700 mt-2" },
                        "\u2713 Admin ACC ",
                        waktu(r.approvedAt),
                        " \u00B7 Gudang APPROVE ",
                        waktu(r.fulfilledAt),
                        "."),
                    r.status === 'rejected' && React.createElement("div", { className: "text-xs text-rose-700 mt-2" }, r.rejectReason || 'Permintaan ditolak.'))),
                !filteredRs.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada permintaan pada periode ini."))));
}
function DriverReturn({ me }) {
    var _a;
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')), driverByProduct = useDbList('driverStockByProduct/' + me.id), legacyStock = useDbValue('driverStock/' + me.username, 0), rs = toList(useDbList('returnRequests')).filter(r => r.driverId === me.id).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0)), [productId, setProductId] = useState(''), [q, setQ] = useState(''), [period, setPeriod] = useState('month'), [date, setDate] = useState(tanggalLokal()), [toast, show] = useToast();
    const selectedStock = productId ? Number(driverByProduct[productId] || 0) : 0;
    const stockByProductVals = Object.values(driverByProduct || {}).map(v => Number(v || 0));
    const totalCarried = stockByProductVals.length ? stockByProductVals.reduce((a, b) => a + b, 0) : Number(legacyStock || 0);
    const send = async () => {
        const n = +q, product = products.find(p => p.id === productId);
        if (!product)
            return show('Pilih jenis produk terlebih dahulu.', 'err');
        if (n < 1 || n > selectedStock)
            return show(`Jumlah tidak valid. Stok ${product.name} Anda ${selectedStock} kantong.`, 'err');
        const r = await db.ref('returnRequests').push({ driverId: me.id, driverName: me.name, productId, productName: product.name, qty: n, status: 'pending', requestedAt: Date.now() });
        await notify({ title: 'Pengembalian stok', message: `${me.name} mengirim pengembalian ${n} kantong ${product.name}. Status: MENUNGGU ACC GUDANG.`, toRole: 'gudang', fromUser: me.id, data: { returnId: r.key, productId }, menu: 'returns' });
        setQ('');
        setProductId('');
        show('Pengembalian dikirim ke Gudang. Menunggu ACC Gudang.');
    };
    const start = new Date(date + 'T00:00:00');
    let end = new Date(start);
    if (period === 'day') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (period === 'month') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    else {
        start.setMonth(0, 0);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    const history = rs.filter(r => (r.requestedAt || r.receivedAt || 0) >= start.getTime() && (r.requestedAt || r.receivedAt || 0) <= end.getTime());
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "KEMBALIKAN SISA ES"),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" },
                React.createElement("div", null,
                    React.createElement("small", null, "DRIVER"),
                    React.createElement("b", { className: "block" }, me.name)),
                React.createElement("div", null,
                    React.createElement("small", null, "STOK LAMA"),
                    React.createElement("b", { className: "block" },
                        totalCarried,
                        " KANTONG")),
                React.createElement("div", null,
                    React.createElement("small", null, "PRODUK DIPILIH"),
                    React.createElement("b", { className: "block" }, ((_a = products.find(p => p.id === productId)) === null || _a === void 0 ? void 0 : _a.name) || '-')),
                React.createElement("div", null,
                    React.createElement("small", null, "STOK PRODUK"),
                    React.createElement("b", { className: "block" },
                        selectedStock,
                        " KANTONG")))),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "grid md:grid-cols-2 gap-3" },
                React.createElement(Field, { label: "Jenis Produk" },
                    React.createElement("select", { className: inputCls, value: productId, onChange: e => setProductId(e.target.value) },
                        React.createElement("option", { value: "" }, "Pilih jenis produk"),
                        products.map(p => React.createElement("option", { key: p.id, value: p.id },
                            p.name,
                            " \u2014 ",
                            Number(driverByProduct[p.id] || 0),
                            " kantong")))),
                React.createElement(Field, { label: "Jumlah yang dikembalikan" },
                    React.createElement("input", { type: "number", min: "1", className: inputCls, value: q, onChange: e => setQ(e.target.value) }))),
            React.createElement(Btn, { tone: "accent", onClick: send }, "Kirim ke Gudang")),
        React.createElement(Card, null,
            React.createElement("div", { className: "flex flex-wrap justify-between gap-3 items-end mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "Riwayat Pengembalian"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Filter harian, bulanan, atau tahunan.")),
                React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                    React.createElement(Field, { label: "Periode" },
                        React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                            React.createElement("option", { value: "day" }, "Harian"),
                            React.createElement("option", { value: "month" }, "Bulanan"),
                            React.createElement("option", { value: "year" }, "Tahunan"))),
                    React.createElement(Field, { label: "Tanggal" },
                        React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) })))),
            React.createElement("div", { className: "space-y-2" },
                history.map(r => React.createElement("div", { key: r.id, className: "p-4 rounded-xl border" },
                    React.createElement("div", { className: "flex justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("b", null,
                                r.productName || 'Es Kristal',
                                " \u00B7 ",
                                r.qty,
                                " kantong"),
                            React.createElement("div", { className: "text-xs" }, waktu(r.requestedAt))),
                        React.createElement(Pill, { tone: r.status === 'approved' ? 'done' : r.status === 'pending' ? 'pending' : 'rejected' }, r.status === 'pending' ? 'MENUNGGU ACC GUDANG' : r.status === 'approved' ? 'APPROVE GUDANG / SELESAI' : 'DITOLAK')),
                    r.status === 'approved' && React.createElement("div", { className: "text-xs text-emerald-700 mt-2" },
                        "\u2713 Sudah dikembalikan dan di-ACC Gudang ",
                        waktu(r.receivedAt),
                        "."),
                    r.status === 'pending' && React.createElement("div", { className: "text-xs text-amber-700 mt-2" }, "Barang sudah dikembalikan, menunggu ACC dari Gudang."),
                    r.status === 'rejected' && React.createElement("div", { className: "text-xs text-rose-700 mt-2" },
                        "\u2715 Ditolak Gudang ",
                        r.rejectedByName ? `oleh ${r.rejectedByName}` : '',
                        " \u00B7 Alasan: ",
                        r.rejectReason || 'Alasan tidak dicatat.'))),
                !history.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada riwayat pengembalian pada periode ini."))));
}
function DriverApp({ me }) { const tabs = [{ key: 'home', label: 'Beranda', icon: '🏠' }, { key: 'waitCash', label: 'WAIT CASH', icon: '💵' }, { key: 'request', label: 'Minta Stok', icon: '📦' }, { key: 'invoiceCustomers', label: 'Pelanggan Invoice', icon: '🧾' }, { key: 'collection', label: 'Penagihan Saya', icon: '💰' }, { key: 'return', label: 'Kembalikan Sisa', icon: '↩️' }, { key: 'reports', label: 'Laporan Saya', icon: '📑' }], [a, setA] = useState('home'); return React.createElement(Shell, { user: me, tabs: tabs, active: a, setActive: setA, onLogout: () => { localStorage.removeItem('glasires_uid'); location.reload(); } },
    a === 'home' && React.createElement(DriverHome, { me: me }),
    " ",
    a === 'waitCash' && React.createElement(WaitCashDriver, { me: me }),
    " ",
    a === 'request' && React.createElement(DriverRequest, { me: me }),
    "  ",
    a === 'invoiceCustomers' && React.createElement(InvoiceDriver, { me: me }),
    " ",
    a === 'collection' && React.createElement(InvoiceCollectionDriver, { me: me }),
    " ",
    a === 'return' && React.createElement(DriverReturn, { me: me }),
    " ",
    a === 'reports' && React.createElement(DriverOwnReport, { me: me })); }
function GudangApp({ me }) { const tabs = [{ key: 'home', label: 'Stok Gudang', icon: '🏔️' }, { key: 'release', label: 'UPPROVE / ACC STOCK', icon: '✅' }, { key: 'returns', label: 'Terima Kembalian', icon: '↩️' }, { key: 'reports', label: 'Laporan Gudang', icon: '📑' }], [a, setA] = useState('home'); return React.createElement(Shell, { user: me, tabs: tabs, active: a, setActive: setA, onLogout: () => { localStorage.removeItem('glasires_uid'); location.reload(); } },
    a === 'home' && React.createElement(GudangHome, { me: me }),
    " ",
    a === 'release' && React.createElement(GudangRelease, { me: me }),
    " ",
    a === 'returns' && React.createElement(GudangReceive, { me: me }),
    " ",
    a === 'reports' && React.createElement(GudangOwnReport, { me: me })); }
