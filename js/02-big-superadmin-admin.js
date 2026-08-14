function AdminNewProducts({ me }) {
    const requests = toList(useDbList('dataRequests')).filter(r => r.type === 'product_master' && r.submittedBy === me.id).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    const [rows, setRows] = useState([{ name: '' }]), [note, setNote] = useState(''), [toast, show] = useToast();
    const add = () => setRows(x => [...x, { name: '' }]);
    const del = i => setRows(x => x.length === 1 ? x : x.filter((_, n) => n !== i));
    const submit = async () => { const names = [...new Set(rows.map(x => String(x.name || '').trim()).filter(Boolean).map(x => x.replace(/\s+/g, ' ')))]; if (!names.length)
        return show('Minimal satu jenis produk harus diisi.', 'err'); const active = toList((await db.ref('config/products').once('value')).val()); const pending = toList((await db.ref('dataRequests').once('value')).val()).filter(r => r.type === 'product_master' && r.status === 'pending').flatMap(r => r.products || []); const dup = names.find(n => active.some(p => (p.name || '').toLowerCase() === n.toLowerCase()) || pending.some(p => (p.name || '').toLowerCase() === n.toLowerCase())); if (dup)
        return show(`Jenis produk ${dup} sudah ada atau sedang menunggu ACC.`, 'err'); const r = db.ref('dataRequests').push(); await r.set({ type: 'product_master', title: 'New Product', products: names.map(name => ({ name })), note: note.trim(), status: 'pending', submittedBy: me.id, submittedByName: me.name, submittedAt: Date.now() }); await notify({ title: 'Permintaan jenis produk baru', message: `${me.name} mengajukan ${names.length} jenis produk baru untuk diperiksa.`, toRole: 'superadmin', fromUser: me.id, data: { requestId: r.key }, menu: 'requests' }); await createAudit('product_master_submit', `${me.name} mengajukan jenis produk: ${names.join(', ')}`, me); setRows([{ name: '' }]); setNote(''); show('Jenis produk berhasil disimpan dan dikirim ke Super Admin. Setelah disimpan, pengajuan ini tidak dapat diedit Admin.'); };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "NEW PRODUCT"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Masukkan jenis produk satu per satu. Tombol Edit hanya untuk memeriksa sebelum disimpan. Setelah disimpan, data terkunci dan menunggu ACC Super Admin."),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "DAFTAR JENIS PRODUK BARU"),
                    React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Belum dikirim = masih bisa diedit atau dihapus.")),
                React.createElement(Btn, { tone: "ghost", onClick: add }, "\uFF0B Tambah Produk")),
            React.createElement("div", { className: "space-y-3" }, rows.map((r, i) => React.createElement("div", { key: i, className: "grid md:grid-cols-[1fr_auto] gap-3 items-end p-4 rounded-2xl border bg-white/70" },
                React.createElement(Field, { label: `Jenis Produk ${i + 1}` },
                    React.createElement("input", { className: inputCls, value: r.name, onChange: e => setRows(v => v.map((x, n) => n === i ? { ...x, name: e.target.value } : x)), placeholder: "Contoh: Es Kristal" })),
                React.createElement(Btn, { tone: "danger", className: "!px-4", onClick: () => del(i) }, "Hapus")))),
            React.createElement("div", { className: "mt-4 flex flex-wrap gap-2" },
                React.createElement(Btn, { tone: "ghost", onClick: () => show('Periksa kembali nama produk dan pastikan tidak ada kesalahan. Anda masih dapat mengedit atau menghapus sebelum tombol Simpan ditekan.') }, "\u270F\uFE0F Edit / Periksa"),
                React.createElement(Btn, { tone: "accent", onClick: submit }, "\uD83D\uDCBE Simpan & Kirim ke Super Admin"))),
        React.createElement(Card, null,
            React.createElement(Field, { label: "Catatan" },
                React.createElement("textarea", { className: inputCls, rows: "3", value: note, onChange: e => setNote(e.target.value), placeholder: "Keterangan tambahan untuk Super Admin" }))),
        React.createElement(ProductRequestHistory, { requests: requests }));
}
function ProductRequestHistory({ requests }) { return React.createElement(Card, { className: "mt-5" },
    React.createElement("div", { className: "flex justify-between mb-4" },
        React.createElement("div", null,
            React.createElement("b", null, "LAPORAN PENGAJUAN JENIS PRODUK"),
            React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Riwayat lengkap pengajuan dan hasil pemeriksaan.")),
        React.createElement(Pill, null,
            requests.length,
            " pengajuan")),
    React.createElement("div", { className: "space-y-3" },
        requests.map(r => React.createElement("div", { key: r.id, className: "p-4 rounded-2xl border bg-white/70" },
            React.createElement("div", { className: "flex justify-between gap-3" },
                React.createElement("div", null,
                    React.createElement("b", null, (r.products || []).map(p => p.name).join(', ') || '-'),
                    React.createElement("div", { className: "text-xs text-slate-500" }, waktu(r.submittedAt))),
                React.createElement(Pill, { tone: r.status === 'approved' ? 'done' : r.status === 'rejected' ? 'rejected' : 'pending' }, r.status === 'approved' ? 'ACC / APPROVE' : r.status === 'rejected' ? 'DITOLAK' : 'MENUNGGU ACC')),
            r.note && React.createElement("div", { className: "text-sm mt-2" },
                "Catatan: ",
                r.note),
            r.status === 'approved' && React.createElement("div", { className: "text-xs text-emerald-700 mt-2" },
                "Disetujui ",
                waktu(r.approvedAt),
                " oleh ",
                r.approvedByName || '-'),
            r.status === 'rejected' && React.createElement("div", { className: "text-xs text-rose-700 mt-2" },
                "Ditolak ",
                waktu(r.rejectedAt),
                " oleh ",
                r.rejectedByName || '-',
                r.rejectNote ? ` · ${r.rejectNote}` : ''))),
        !requests.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada pengajuan jenis produk."))); }
function AdminCompanyPrice({ me }) {
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const [rows, setRows] = useState([{ productId: '', standardPrice: '' }]), [toast, show] = useToast();
    const add = () => setRows(x => [...x, { productId: '', standardPrice: '' }]);
    const del = i => setRows(x => x.length === 1 ? x : x.filter((_, n) => n !== i));
    const submit = async () => { const clean = rows.filter(x => x.productId && +x.standardPrice > 0).map(x => { const p = products.find(y => y.id === x.productId); return { productId: x.productId, name: (p === null || p === void 0 ? void 0 : p.name) || '', standardPrice: +x.standardPrice }; }); if (!clean.length)
        return show('Pilih jenis produk dan isi nilai standar.', 'err'); const r = db.ref('dataRequests').push(); await r.set({ type: 'standard_price_request', title: 'Perubahan Nilai Standar', products: clean, status: 'pending', submittedBy: me.id, submittedByName: me.name, submittedAt: Date.now() }); await notify({ title: 'Permintaan perubahan nilai standar', message: `${me.name} mengajukan perubahan nilai standar untuk ${clean.length} produk.`, toRole: 'superadmin', fromUser: me.id, data: { requestId: r.key }, menu: 'requests' }); await createAudit('standard_price_submit', `${me.name} mengajukan perubahan nilai standar`, me); setRows([{ productId: '', standardPrice: '' }]); show('Permintaan nilai standar dikirim ke Super Admin.'); };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "INPUT DATA PERUSAHAAN"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Pilih jenis produk yang sudah disetujui, lalu masukkan nilai standar. Perubahan harus mendapat ACC Super Admin."),
        React.createElement(Card, null,
            React.createElement("div", { className: "space-y-3" }, rows.map((r, i) => React.createElement("div", { key: i, className: "grid md:grid-cols-[1fr_260px_auto] gap-3 items-end p-4 rounded-2xl border bg-white/70" },
                React.createElement(Field, { label: "Jenis Produk" },
                    React.createElement("select", { className: inputCls, value: r.productId, onChange: e => setRows(v => v.map((x, n) => n === i ? { ...x, productId: e.target.value } : x)) },
                        React.createElement("option", { value: "" }, "Pilih jenis produk"),
                        products.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name)))),
                React.createElement(Field, { label: "Nilai Standar" },
                    React.createElement("input", { type: "number", min: "0", className: inputCls, value: r.standardPrice, onChange: e => setRows(v => v.map((x, n) => n === i ? { ...x, standardPrice: e.target.value } : x)), placeholder: "Rp" })),
                React.createElement(Btn, { tone: "danger", className: "!px-3", onClick: () => del(i) }, "Hapus")))),
            React.createElement("div", { className: "flex flex-wrap gap-2 mt-4" },
                React.createElement(Btn, { tone: "ghost", onClick: add }, "\uFF0B Tambah"),
                React.createElement(Btn, { tone: "accent", onClick: submit }, "\uD83D\uDCE8 Simpan & Kirim ke Super Admin"))));
}
function AdminCustomerOffer({ me }) {
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const customers = toList(useDbList('invoiceCustomers')).filter(c => c.approvalStatus === 'approved' && c.status !== 'rejected').sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''));
    const [rows, setRows] = useState([{ productId: '', customerId: '', price: '' }]), [toast, show] = useToast();
    const add = () => setRows(x => [...x, { productId: '', customerId: '', price: '' }]);
    const del = i => setRows(x => x.length === 1 ? x : x.filter((_, n) => n !== i));
    const submit = async () => { const clean = rows.filter(x => x.productId && x.customerId && +x.price > 0).map(x => { var _a, _b; return ({ productId: x.productId, customerId: x.customerId, price: +x.price, productName: ((_a = products.find(p => p.id === x.productId)) === null || _a === void 0 ? void 0 : _a.name) || '', customerName: ((_b = customers.find(c => c.id === x.customerId)) === null || _b === void 0 ? void 0 : _b.customerName) || '' }); }); if (!clean.length)
        return show('Pilih jenis produk, pelanggan, dan isi harga.', 'err'); const r = db.ref('dataRequests').push(); await r.set({ type: 'customer_price_request', title: 'Penawaran Harga Pelanggan Invoice', items: clean, status: 'pending', submittedBy: me.id, submittedByName: me.name, submittedAt: Date.now() }); await notify({ title: 'Permintaan harga pelanggan invoice', message: `${me.name} mengajukan ${clean.length} harga pelanggan untuk diperiksa.`, toRole: 'superadmin', fromUser: me.id, data: { requestId: r.key }, menu: 'requests' }); await createAudit('customer_price_submit', `${me.name} mengajukan harga pelanggan invoice`, me); setRows([{ productId: '', customerId: '', price: '' }]); show('Harga pelanggan berhasil dikirim ke Super Admin.'); };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "PENAWARAN HARGA PELANGGAN"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Cukup pilih jenis produk, pilih pelanggan invoice, masukkan harga, lalu kirim untuk ACC."),
        React.createElement(Card, null,
            React.createElement("div", { className: "space-y-3" }, rows.map((r, i) => React.createElement("div", { key: i, className: "grid md:grid-cols-[1fr_1fr_220px_auto] gap-3 items-end p-4 rounded-2xl border bg-white/70" },
                React.createElement(Field, { label: "Jenis Produk" },
                    React.createElement("select", { className: inputCls, value: r.productId, onChange: e => setRows(v => v.map((x, n) => n === i ? { ...x, productId: e.target.value } : x)) },
                        React.createElement("option", { value: "" }, "Pilih jenis produk"),
                        products.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name)))),
                React.createElement(Field, { label: "Pelanggan Invoice" },
                    React.createElement("select", { className: inputCls, value: r.customerId, onChange: e => setRows(v => v.map((x, n) => n === i ? { ...x, customerId: e.target.value } : x)) },
                        React.createElement("option", { value: "" }, "Pilih pelanggan"),
                        customers.map(c => React.createElement("option", { key: c.id, value: c.id }, c.customerName)))),
                React.createElement(Field, { label: "Nilai Harga" },
                    React.createElement("input", { type: "number", min: "0", className: inputCls, value: r.price, onChange: e => setRows(v => v.map((x, n) => n === i ? { ...x, price: e.target.value } : x)), placeholder: "Rp" })),
                React.createElement(Btn, { tone: "danger", className: "!px-3", onClick: () => del(i) }, "Hapus")))),
            React.createElement("div", { className: "flex flex-wrap gap-2 mt-4" },
                React.createElement(Btn, { tone: "ghost", onClick: add }, "\uFF0B Tambah"),
                React.createElement(Btn, { tone: "accent", onClick: submit }, "\uD83D\uDCE8 Simpan & Kirim ke Super Admin"))));
}
function DataRequestReport({ me, isSuper = false }) { const requests = toList(useDbList('dataRequests')).filter(r => (r.status === 'approved' || r.status === 'rejected') && (isSuper || r.submittedBy === me.id)).sort((a, b) => ((b.approvedAt || b.rejectedAt || 0) - (a.approvedAt || a.rejectedAt || 0))); const customers = toList(useDbList('invoiceCustomers')).filter(c => c.approvalStatus === 'approved'); const cfg = useDbValue('config/company', {}); const [period, setPeriod] = useState('month'), [date, setDate] = useState(tanggalLokal()); const range = periodRange(period, date); const rows = requests.filter(r => { const t = r.status === 'approved' ? (r.approvedAt || 0) : (r.rejectedAt || 0); return t >= range.start && t <= range.end; }); const approved = rows.filter(r => r.status === 'approved').length, rejected = rows.filter(r => r.status === 'rejected').length; const detail = r => { if (r.type === 'product_master')
    return (r.products || []).map(p => `${p.name} (harga standar: ${rupiah(p.standardPrice || 0)})`).join(' | '); if (r.type === 'standard_price_request')
    return (r.products || []).map(x => `${x.name || x.productName || x.productId} (harga: ${rupiah(x.standardPrice || 0)})`).join(' | '); if (r.type === 'customer_price_request')
    return (r.items || []).map(x => { var _a; return `${x.productName || '-'} / ${x.customerName || ((_a = customers.find(c => c.id === x.customerId)) === null || _a === void 0 ? void 0 : _a.customerName) || '-'}: ${rupiah(x.price || 0)}`; }).join(' | '); return r.title || 'Permintaan Data'; }; return React.createElement("div", { className: "fade-in" },
    React.createElement("div", { className: "no-print" },
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "LAPORAN ACC / TOLAK"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Semua permintaan yang sudah diproses. Gunakan filter harian, bulanan, atau tahunan berdasarkan tanggal keputusan."),
        React.createElement("div", { className: "flex flex-wrap items-end justify-between gap-3" },
            React.createElement(DateRange, { period, setPeriod, date, setDate }),
            React.createElement("button", { type: "button", onClick: () => window.print(), className: "px-4 py-2.5 rounded-2xl text-sm font-bold border bg-glacier-900 text-white shadow-sm" }, "\uD83D\uDDA8 CETAK LAPORAN"))),
    React.createElement("div", { className: "report-page report-print-area", style: { '--report-color': cfg.reportColor || '#1c4a73' } },
        React.createElement("div", { className: "report-head" },
            React.createElement("div", { className: "report-logo-placeholder" }, cfg.logo ? React.createElement("img", { className: "report-logo", src: cfg.logo }) : React.createElement("div", { className: "report-logo-fallback" }, "\u2713")),
            React.createElement("div", null,
                React.createElement("div", { className: "report-title text-2xl font-bold" }, cfg.name || 'GlasirEs'),
                React.createElement("div", { className: "text-sm" }, cfg.address || 'Alamat perusahaan belum diatur'),
                cfg.phone && React.createElement("div", { className: "text-sm" }, cfg.phone))),
        React.createElement("div", { className: "mt-5 report-subhead" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold" }, "LAPORAN ACC / TOLAK PERMINTAAN DATA"),
                React.createElement("p", { className: "text-sm mt-1" },
                    "Periode: ",
                    range.a.toLocaleDateString('id-ID'),
                    " s/d ",
                    range.e.toLocaleDateString('id-ID'))),
            React.createElement("div", { className: "text-right text-xs text-slate-500" },
                "Dibuat oleh",
                React.createElement("br", null),
                React.createElement("b", null, me.name))),
        React.createElement("div", { className: "grid grid-cols-3 gap-3 my-5 report-summary" },
            React.createElement("div", { className: "report-stat" },
                React.createElement("span", null, "Total Diproses"),
                React.createElement("b", null, rows.length)),
            React.createElement("div", { className: "report-stat report-stat-ok" },
                React.createElement("span", null, "ACC"),
                React.createElement("b", null, approved)),
            React.createElement("div", { className: "report-stat report-stat-no" },
                React.createElement("span", null, "Tolak"),
                React.createElement("b", null, rejected))),
        React.createElement("div", { className: "overflow-x-auto mt-4" },
            React.createElement("table", { className: "w-full text-sm report-table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "NO"),
                        React.createElement("th", null, "TANGGAL KEPUTUSAN"),
                        React.createElement("th", null, "TANGGAL PENGAJUAN"),
                        React.createElement("th", null, "PENGAJU"),
                        React.createElement("th", null, "JENIS PERMINTAAN"),
                        React.createElement("th", null, "DETAIL DATA"),
                        React.createElement("th", null, "STATUS"),
                        React.createElement("th", null, "ALASAN PENOLAKAN"),
                        React.createElement("th", null, "DIPROSES OLEH"))),
                React.createElement("tbody", null,
                    rows.map((r, i) => { const t = r.status === 'approved' ? (r.approvedAt || 0) : (r.rejectedAt || 0); return React.createElement("tr", { key: r.id },
                        React.createElement("td", null, i + 1),
                        React.createElement("td", null, waktu(t)),
                        React.createElement("td", null, waktu(r.submittedAt)),
                        React.createElement("td", null, r.submittedByName || '-'),
                        React.createElement("td", null, r.title || r.type || 'Permintaan Data'),
                        React.createElement("td", null, detail(r)),
                        React.createElement("td", null,
                            React.createElement(Pill, { tone: r.status === 'approved' ? 'approved' : 'rejected' }, r.status === 'approved' ? 'ACC' : 'TOLAK')),
                        React.createElement("td", null, r.status === 'rejected' ? (r.rejectReason || r.rejectNote || 'Alasan tidak dicatat') : '-'),
                        React.createElement("td", null, r.status === 'approved' ? (r.approvedByName || '-') : (r.rejectedByName || '-'))); }),
                    !rows.length && React.createElement("tr", null,
                        React.createElement("td", { colSpan: "9", className: "py-8 text-center text-slate-400" }, "Belum ada data ACC / TOLAK pada periode ini."))))),
        React.createElement("div", { className: "report-footer-note" }, "Laporan ini menampilkan keputusan berdasarkan tanggal ACC/Tolak. Alasan penolakan dicatat dan dikirim kepada Admin terkait."),
        React.createElement("div", { className: "print-signature" },
            React.createElement("div", { className: "sig-box" },
                React.createElement("div", null, "Mengetahui,"),
                React.createElement("div", { className: "sig-space" }),
                React.createElement("div", { className: "sig-line" }),
                React.createElement("div", { className: "sig-name" }, "Super Admin"),
                React.createElement("div", { className: "sig-role" }, "Penanggung Jawab")),
            React.createElement("div", { className: "sig-box" },
                React.createElement("div", null, "Dibuat oleh,"),
                React.createElement("div", { className: "sig-space" }),
                React.createElement("div", { className: "sig-line" }),
                React.createElement("div", { className: "sig-name" }, me.name),
                React.createElement("div", { className: "sig-role" }, "Petugas Laporan"))))); }
function PriceChangeReport({ me, isSuper = false }) { const logs = toList(useDbList('priceChangeLogs')).filter(x => isSuper || x.by === me.id || x.targetAdmin === me.id).sort((a, b) => (b.at || 0) - (a.at || 0)); const cfg = useDbValue('config/company', {}); const [period, setPeriod] = useState('month'), [date, setDate] = useState(tanggalLokal()); const range = periodRange(period, date); const rows = logs.filter(x => (x.at || 0) >= range.start && (x.at || 0) <= range.end); return React.createElement("div", { className: "fade-in" },
    React.createElement("div", { className: "no-print" },
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "LAPORAN PERUBAHAN PRODUK & HARGA"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Semua perubahan dapat diperiksa harian, bulanan, atau tahunan."),
        React.createElement("div", { className: "flex flex-wrap items-end justify-between gap-3" },
            React.createElement(DateRange, { period, setPeriod, date, setDate }),
            React.createElement("button", { type: "button", onClick: () => window.print(), className: "px-4 py-2.5 rounded-2xl text-sm font-bold border bg-glacier-900 text-white shadow-sm" }, "\uD83D\uDDA8 CETAK LAPORAN"))),
    React.createElement("div", { className: "report-page report-print-area", style: { '--report-color': cfg.reportColor || '#1c4a73' } },
        React.createElement("div", { className: "report-head" },
            React.createElement("div", { className: "report-logo-placeholder" }, cfg.logo ? React.createElement("img", { className: "report-logo", src: cfg.logo }) : React.createElement("div", { className: "report-logo-fallback" }, "\u2713")),
            React.createElement("div", null,
                React.createElement("div", { className: "report-title text-2xl font-bold" }, cfg.name || 'GlasirEs'),
                React.createElement("div", { className: "text-sm" }, cfg.address || 'Alamat perusahaan belum diatur'),
                cfg.phone && React.createElement("div", { className: "text-sm" }, cfg.phone))),
        React.createElement("div", { className: "mt-5 report-subhead" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold" }, "LAPORAN PERUBAHAN PRODUK & HARGA"),
                React.createElement("p", { className: "text-sm mt-1" },
                    "Periode: ",
                    range.a.toLocaleDateString('id-ID'),
                    " s/d ",
                    range.e.toLocaleDateString('id-ID'))),
            React.createElement("div", { className: "text-right text-xs text-slate-500" },
                "Dibuat oleh",
                React.createElement("br", null),
                React.createElement("b", null, me.name))),
        React.createElement("div", { className: "grid grid-cols-2 gap-3 my-5 report-summary" },
            React.createElement("div", { className: "report-stat" },
                React.createElement("span", null, "Total Perubahan"),
                React.createElement("b", null, rows.length)),
            React.createElement("div", { className: "report-stat report-stat-ok" },
                React.createElement("span", null, "Periode"),
                React.createElement("b", { className: "text-sm" }, period === 'day' ? 'HARIAN' : period === 'month' ? 'BULANAN' : 'TAHUNAN'))),
        React.createElement("div", { className: "overflow-x-auto mt-4" },
            React.createElement("table", { className: "w-full text-sm report-table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "NO"),
                        React.createElement("th", null, "TANGGAL"),
                        React.createElement("th", null, "JENIS PERUBAHAN"),
                        React.createElement("th", null, "PRODUK"),
                        React.createElement("th", null, "PELANGGAN"),
                        React.createElement("th", null, "SEBELUM"),
                        React.createElement("th", null, "SESUDAH"),
                        React.createElement("th", null, "DILAKUKAN OLEH"),
                        React.createElement("th", null, "KETERANGAN"))),
                React.createElement("tbody", null,
                    rows.map((r, i) => React.createElement("tr", { key: r.id },
                        React.createElement("td", null, i + 1),
                        React.createElement("td", null, waktu(r.at)),
                        React.createElement("td", null, r.action || '-'),
                        React.createElement("td", null, r.productName || '-'),
                        React.createElement("td", null, r.customerName || '-'),
                        React.createElement("td", null, r.oldPrice == null ? '-' : rupiah(r.oldPrice)),
                        React.createElement("td", null, r.newPrice == null ? '-' : rupiah(r.newPrice)),
                        React.createElement("td", null, r.byName || '-'),
                        React.createElement("td", null, r.note || '-'))),
                    !rows.length && React.createElement("tr", null,
                        React.createElement("td", { colSpan: "9", className: "py-8 text-center text-slate-400" }, "Belum ada perubahan pada periode ini."))))),
        React.createElement("div", { className: "report-footer-note" }, "Seluruh perubahan harga dan produk yang tercatat pada periode ini menjadi bagian dari riwayat pengawasan sistem."),
        React.createElement("div", { className: "print-signature" },
            React.createElement("div", { className: "sig-box" },
                React.createElement("div", null, "Mengetahui,"),
                React.createElement("div", { className: "sig-space" }),
                React.createElement("div", { className: "sig-line" }),
                React.createElement("div", { className: "sig-name" }, "Super Admin"),
                React.createElement("div", { className: "sig-role" }, "Penanggung Jawab")),
            React.createElement("div", { className: "sig-box" },
                React.createElement("div", null, "Dibuat oleh,"),
                React.createElement("div", { className: "sig-space" }),
                React.createElement("div", { className: "sig-line" }),
                React.createElement("div", { className: "sig-name" }, me.name),
                React.createElement("div", { className: "sig-role" }, "Petugas Laporan"))))); }
function AdminCompanyData({ me }) { const [sub, setSub] = useState('company'); const tabs = [['company', 'INPUT DATA PERUSAHAAN'], ['newProduct', 'NEW PRODUCT'], ['offer', 'PENAWARAN PELANGGAN'], ['approvalReport', 'LAPORAN ACC / TOLAK'], ['report', 'LAPORAN PERUBAHAN']]; return React.createElement("div", null,
    React.createElement("div", { className: "flex flex-wrap gap-2 mb-5 print-hide" }, tabs.map(x => React.createElement("button", { key: x[0], onClick: () => setSub(x[0]), className: 'px-4 py-2.5 rounded-2xl text-sm font-semibold border ' + (sub === x[0] ? 'bg-glacier-900 text-white' : 'bg-white text-glacier-700') }, x[1]))),
    sub === 'company' && React.createElement(AdminCompanyPrice, { me: me }),
    " ",
    sub === 'newProduct' && React.createElement(AdminNewProducts, { me: me }),
    " ",
    sub === 'offer' && React.createElement(AdminCustomerOffer, { me: me }),
    " ",
    sub === 'approvalReport' && React.createElement(DataRequestReport, { me: me }),
    " ",
    sub === 'report' && React.createElement(PriceChangeReport, { me: me })); }
function SuperDataRequests({ me }) {
    const requests = toList(useDbList('dataRequests')).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    const customers = toList(useDbList('invoiceCustomers')).filter(c => c.approvalStatus === 'approved' && c.status !== 'rejected');
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const [toast, show] = useToast();
    const approveProduct = async (r) => { const list = (r.products || []).filter(p => String(p.name || '').trim()); if (!list.length)
        return show('Tidak ada produk yang bisa disetujui.', 'err'); for (const p of list) {
        const ref = db.ref('config/products').push();
        await ref.set({ name: p.name.trim(), standardPrice: 0, customerPrices: {}, active: true, createdAt: Date.now(), createdBy: me.id, createdByName: me.name });
        await db.ref('priceChangeLogs').push({ action: 'TAMBAH PRODUK', productName: p.name.trim(), oldPrice: null, newPrice: 0, by: me.id, byName: me.name, at: Date.now(), note: 'Jenis produk baru disetujui' });
    } await db.ref('dataRequests/' + r.id).update({ status: 'approved', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() }); await notify({ title: 'Jenis produk disetujui', message: `Pengajuan jenis produk Anda telah di-ACC dan sekarang tersedia di sistem.`, toUser: r.submittedBy, fromUser: me.id, data: { requestId: r.id }, menu: 'companyData' }); await createAudit('product_master_approved', `Menyetujui jenis produk dari ${r.submittedByName || 'Admin'}`, me); show('Jenis produk disetujui dan sudah aktif.'); };
    const reject = async (r) => { if (!confirm('Tolak permintaan ini?'))
        return; const reason = prompt('Masukkan alasan penolakan yang akan dikirim kepada Admin:', ''); if (reason === null)
        return; if (!String(reason).trim())
        return show('Alasan penolakan wajib diisi.', 'err'); const now = Date.now(); await db.ref('dataRequests/' + r.id).update({ status: 'rejected', rejectedBy: me.id, rejectedByName: me.name, rejectedAt: now, rejectReason: String(reason).trim(), rejectNote: String(reason).trim() }); await notify({ title: 'Permintaan ditolak', message: `Permintaan ${r.title || 'data'} dari Anda ditolak oleh Super Admin. Alasan: ${String(reason).trim()}`, toUser: r.submittedBy, fromUser: me.id, data: { requestId: r.id, rejectionReason: String(reason).trim() }, menu: 'companyData' }); await createAudit('data_request_rejected', `Menolak ${r.title || 'permintaan data'} dari ${r.submittedByName || 'Admin'}: ${String(reason).trim()}`, me); show('Permintaan ditolak dan alasan sudah dikirim ke Admin.', 'err'); };
    const approveStandard = async (r) => { for (const x of r.products || []) {
        const ref = db.ref('config/products/' + x.productId);
        const snap = await ref.once('value');
        const old = snap.val();
        if (!old)
            continue;
        await ref.update({ standardPrice: +x.standardPrice || 0, updatedAt: Date.now(), updatedBy: me.id, updatedByName: me.name });
        await db.ref('priceChangeLogs').push({ action: 'UBAH HARGA STANDAR', productName: old.name, oldPrice: +old.standardPrice || 0, newPrice: +x.standardPrice || 0, by: me.id, byName: me.name, targetAdmin: r.submittedBy, at: Date.now(), note: 'Permintaan Admin disetujui' });
    } await db.ref('dataRequests/' + r.id).update({ status: 'approved', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() }); await notify({ title: 'Perubahan nilai standar disetujui', message: 'Permintaan nilai standar Anda telah disetujui dan harga sudah diperbarui.', toUser: r.submittedBy, fromUser: me.id, data: { requestId: r.id }, menu: 'companyData' }); await createAudit('standard_price_approved', `Menyetujui perubahan nilai standar dari ${r.submittedByName || 'Admin'}`, me); show('Nilai standar diperbarui.'); };
    const approveCustomer = async (r) => { var _a; for (const x of r.items || []) {
        const ref = db.ref('config/products/' + x.productId);
        const snap = await ref.once('value');
        const old = snap.val();
        if (!old)
            continue;
        const before = (_a = old.customerPrices) === null || _a === void 0 ? void 0 : _a[x.customerId];
        await ref.update({ customerPrices: { ...(old.customerPrices || {}), [x.customerId]: +x.price || 0 }, updatedAt: Date.now(), updatedBy: me.id, updatedByName: me.name });
        await db.ref('priceChangeLogs').push({ action: 'UBAH HARGA PELANGGAN', productName: old.name, customerName: x.customerName, oldPrice: before == null ? null : +before, newPrice: +x.price || 0, by: me.id, byName: me.name, targetAdmin: r.submittedBy, at: Date.now(), note: 'Penawaran pelanggan disetujui' });
    } await db.ref('dataRequests/' + r.id).update({ status: 'approved', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() }); await notify({ title: 'Harga pelanggan disetujui', message: 'Permintaan harga pelanggan invoice Anda telah disetujui dan harga sudah diperbarui.', toUser: r.submittedBy, fromUser: me.id, data: { requestId: r.id }, menu: 'companyData' }); await createAudit('customer_price_approved', `Menyetujui harga pelanggan dari ${r.submittedByName || 'Admin'}`, me); show('Harga pelanggan diperbarui.'); };
    const pending = requests.filter(r => r.status === 'pending');
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "PERMINTAAN DATA"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Semua permintaan Admin diperiksa di sini. Super Admin dapat ACC atau Tolak sebelum data aktif."),
        React.createElement("div", { className: "space-y-5" },
            pending.map(r => React.createElement(Card, { key: r.id },
                React.createElement("div", { className: "flex flex-wrap justify-between gap-3 mb-4" },
                    React.createElement("div", null,
                        React.createElement("b", null, r.title || 'Permintaan Data'),
                        React.createElement("div", { className: "text-xs text-slate-500" },
                            "Dikirim ",
                            r.submittedByName || '-',
                            " \u00B7 ",
                            waktu(r.submittedAt))),
                    React.createElement(Pill, { tone: "pending" }, "MENUNGGU ACC")),
                r.type === 'product_master' && React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border" },
                    React.createElement("b", null, "Jenis Produk Baru"),
                    React.createElement("div", { className: "mt-2 flex flex-wrap gap-2" }, (r.products || []).map((p, i) => React.createElement(Pill, { key: i }, p.name)))),
                r.type === 'standard_price_request' && React.createElement("div", { className: "space-y-2" }, (r.products || []).map(x => { const p = products.find(y => y.id === x.productId); return React.createElement("div", { key: x.productId, className: "p-4 rounded-2xl border" },
                    React.createElement("b", null, (p === null || p === void 0 ? void 0 : p.name) || x.name),
                    React.createElement("div", { className: "text-sm mt-1" },
                        "Nilai standar diajukan: ",
                        React.createElement("b", null, rupiah(x.standardPrice)),
                        " \u00B7 Saat ini: ",
                        React.createElement("b", null, rupiah((p === null || p === void 0 ? void 0 : p.standardPrice) || 0)))); })),
                r.type === 'customer_price_request' && React.createElement("div", { className: "space-y-2" }, (r.items || []).map((x, i) => React.createElement("div", { key: i, className: "p-4 rounded-2xl border" },
                    React.createElement("b", null, x.productName),
                    " \u00B7 ",
                    x.customerName,
                    React.createElement("div", { className: "text-sm mt-1" },
                        "Harga diajukan: ",
                        React.createElement("b", null, rupiah(x.price)))))),
                React.createElement("div", { className: "flex flex-wrap gap-2 mt-5 pt-4 border-t" },
                    React.createElement(Btn, { tone: "accent", onClick: () => r.type === 'product_master' ? approveProduct(r) : r.type === 'standard_price_request' ? approveStandard(r) : approveCustomer(r) }, "\u2713 ACC & AKTIFKAN"),
                    React.createElement(Btn, { tone: "danger", onClick: () => reject(r) }, "Tolak")))),
            !pending.length && React.createElement(Card, null,
                React.createElement("div", { className: "text-center text-slate-400 py-8" }, "Tidak ada permintaan yang menunggu ACC."))));
}
function SuperProductManager({ me }) { const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')); const customers = toList(useDbList('invoiceCustomers')).filter(c => c.approvalStatus === 'approved' && c.status !== 'rejected'); const [edit, setEdit] = useState({}), [toast, show] = useToast(); const save = async (p) => { var _a; const x = edit[p.id] || {}; const name = String((_a = x.name) !== null && _a !== void 0 ? _a : p.name).trim(); if (!name)
    return show('Nama produk wajib diisi.', 'err'); const oldName = p.name; await db.ref('config/products/' + p.id).update({ name, updatedAt: Date.now(), updatedBy: me.id, updatedByName: me.name }); if (name !== oldName) {
    await db.ref('priceChangeLogs').push({ action: 'UBAH NAMA PRODUK', productName: name, by: me.id, byName: me.name, at: Date.now(), note: `Nama sebelumnya: ${oldName}` });
    await notify({ title: 'Nama produk diubah', message: `Jenis produk ${oldName} diubah menjadi ${name} oleh Super Admin.`, toRole: 'admin', fromUser: me.id, menu: 'companyData' });
} setEdit(e => { const z = { ...e }; delete z[p.id]; return z; }); show('Nama produk diperbarui.'); }; const del = async (p) => { if (!confirm(`Hapus jenis produk ${p.name}? Produk tidak akan tampil lagi untuk input baru.`))
    return; await db.ref('config/products/' + p.id).update({ active: false, deletedAt: Date.now(), deletedBy: me.id, deletedByName: me.name }); await db.ref('priceChangeLogs').push({ action: 'HAPUS PRODUK', productName: p.name, by: me.id, byName: me.name, at: Date.now(), note: 'Dinonaktifkan oleh Super Admin' }); await notify({ title: 'Jenis produk dihapus', message: `Jenis produk ${p.name} telah dinonaktifkan oleh Super Admin.`, toRole: 'admin', fromUser: me.id, menu: 'companyData' }); show('Jenis produk berhasil dihapus.'); }; const updatePrice = async (p, cid, val) => { var _a; const n = +val; if (!Number.isFinite(n) || n < 0)
    return; const old = (_a = p.customerPrices) === null || _a === void 0 ? void 0 : _a[cid]; await db.ref('config/products/' + p.id).update({ customerPrices: { ...(p.customerPrices || {}), [cid]: n }, updatedAt: Date.now(), updatedBy: me.id, updatedByName: me.name }); const c = customers.find(x => x.id === cid); await db.ref('priceChangeLogs').push({ action: 'UBAH HARGA PELANGGAN', productName: p.name, customerName: (c === null || c === void 0 ? void 0 : c.customerName) || cid, oldPrice: old == null ? null : +old, newPrice: n, by: me.id, byName: me.name, targetAdmin: null, at: Date.now(), note: 'Diubah langsung oleh Super Admin' }); await notify({ title: 'Harga pelanggan berubah', message: `Harga ${p.name} untuk ${(c === null || c === void 0 ? void 0 : c.customerName) || 'pelanggan'} telah diperbarui oleh Super Admin.`, toRole: 'admin', fromUser: me.id, menu: 'companyData' }); show('Harga pelanggan diperbarui.'); }; const updateStandard = async (p, val) => { const n = +val; if (!Number.isFinite(n) || n < 0)
    return; const old = +p.standardPrice || 0; await db.ref('config/products/' + p.id).update({ standardPrice: n, updatedAt: Date.now(), updatedBy: me.id, updatedByName: me.name }); await db.ref('priceChangeLogs').push({ action: 'UBAH HARGA STANDAR', productName: p.name, oldPrice: old, newPrice: n, by: me.id, byName: me.name, at: Date.now(), note: 'Diubah langsung oleh Super Admin' }); await notify({ title: 'Harga standar berubah', message: `Nilai standar ${p.name} telah diperbarui oleh Super Admin.`, toRole: 'admin', fromUser: me.id, menu: 'companyData' }); show('Harga standar diperbarui.'); }; return React.createElement("div", null,
    toast,
    React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "PRODUK & HARGA AKTIF"),
    React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Super Admin dapat mengubah nama, menghapus produk, dan memperbarui harga secara langsung. Semua perubahan masuk laporan dan notifikasi."),
    React.createElement("div", { className: "space-y-4" },
        products.map(p => { var _a, _b; return React.createElement(Card, { key: p.id },
            React.createElement("div", { className: "flex flex-wrap items-end gap-2" },
                React.createElement("div", { className: "flex-1 min-w-[220px]" },
                    React.createElement(Field, { label: "Jenis Produk" },
                        React.createElement("input", { className: inputCls, value: (_b = (_a = edit[p.id]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : p.name, onChange: e => setEdit(v => ({ ...v, [p.id]: { ...v[p.id], name: e.target.value } })) }))),
                React.createElement(Btn, { tone: "accent", onClick: () => save(p) }, "Simpan Nama"),
                React.createElement(Btn, { tone: "danger", onClick: () => del(p) }, "Hapus Produk")),
            React.createElement("div", { className: "grid md:grid-cols-2 gap-4 mt-4" },
                React.createElement(Field, { label: "Harga Standar" },
                    React.createElement("input", { type: "number", className: inputCls, defaultValue: p.standardPrice || 0, onBlur: e => updateStandard(p, e.target.value) })),
                React.createElement("div", null,
                    React.createElement("div", { className: "text-xs font-semibold text-glacier-600 mb-2" }, "Harga Pelanggan Invoice"),
                    React.createElement("div", { className: "space-y-2" },
                        customers.map(c => { var _a, _b; return React.createElement("div", { key: c.id, className: "grid grid-cols-[1fr_160px] gap-2 items-center" },
                            React.createElement("span", { className: "text-sm" }, c.customerName),
                            React.createElement("input", { type: "number", className: inputCls, defaultValue: (_b = (_a = p.customerPrices) === null || _a === void 0 ? void 0 : _a[c.id]) !== null && _b !== void 0 ? _b : '', placeholder: "Belum diatur", onBlur: e => e.target.value !== '' && updatePrice(p, c.id, e.target.value) })); }),
                        !customers.length && React.createElement("div", { className: "text-xs text-slate-400" }, "Belum ada pelanggan invoice yang ACC."))))); }),
        !products.length && React.createElement(Card, null,
            React.createElement("div", { className: "text-center text-slate-400 py-8" }, "Belum ada jenis produk aktif.")))); }
function SuperDataRequestMenu({ me }) { const [sub, setSub] = useState('pending'); const tabs = [['pending', 'PERMINTAAN DATA'], ['products', 'PRODUK & HARGA AKTIF'], ['approvalReport', 'LAPORAN ACC / TOLAK'], ['report', 'LAPORAN PERUBAHAN']]; return React.createElement("div", null,
    React.createElement("div", { className: "flex flex-wrap gap-2 mb-5 print-hide" }, tabs.map(x => React.createElement("button", { key: x[0], onClick: () => setSub(x[0]), className: 'px-4 py-2.5 rounded-2xl text-sm font-semibold border ' + (sub === x[0] ? 'bg-glacier-900 text-white' : 'bg-white text-glacier-700') }, x[1]))),
    sub === 'pending' && React.createElement(SuperDataRequests, { me: me }),
    " ",
    sub === 'products' && React.createElement(SuperProductManager, { me: me }),
    " ",
    sub === 'approvalReport' && React.createElement(DataRequestReport, { me: me, isSuper: true }),
    " ",
    sub === 'report' && React.createElement(PriceChangeReport, { me: me, isSuper: true })); }
function BigSuperAdmin({ me }) {
    const keluarBig = () => { localStorage.removeItem('glasires_uid'); location.reload(); };
    const users = toList(useDbList('users'));
    const deliveries = toList(useDbList('deliveries'));
    const stockRequests = toList(useDbList('stockRequests'));
    const returns = toList(useDbList('returnRequests'));
    const invoices = toList(useDbList('invoiceCustomers'));
    const notifications = toList(useDbList('notifications'));
    const logs = toList(useDbList('logs'));
    const warehouseHistory = toList(useDbList('warehouse/history'));
    const driverStocks = toList(useDbList('driverStock'));
    const dataRequests = toList(useDbList('dataRequests')).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    const warehouseStock = useDbValue('warehouse/stock', 0);
    const products = toList(useDbList('config/products')).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const warehouseStockByProduct = useDbList('warehouse/stockByProduct');
    const [tab, setTab] = useState('dashboard');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [stockEdit, setStockEdit] = useState('');
    const [deleteStockProductId, setDeleteStockProductId] = useState('');
    const [deleteProductId, setDeleteProductId] = useState('');
    const [toast, show] = useToast();
    const verifyBig = async () => {
        if (!password)
            return false;
        return (await sha256(password)) === me.passwordHash;
    };
    const resetDatabase = async () => {
        if (busy)
            return;
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        const ok1 = confirm('⚠️ RESET TOTAL DATABASE\\n\\nSEMUA DATA aplikasi akan dihapus: user Admin, Super Admin, Driver, Gudang, transaksi, stok driver, stok gudang, invoice, notifikasi, laporan, log, pengaturan, dan data lainnya.\\n\\nAkun BIG SUPER ADMIN akan dibuat kembali agar Anda tetap bisa masuk.\\n\\nLanjutkan?');
        if (!ok1)
            return;
        const ok2 = prompt('Ketik RESET DATABASE untuk konfirmasi:');
        if (ok2 !== 'RESET DATABASE') {
            show('Reset dibatalkan.', 'err');
            return;
        }
        setBusy(true);
        try {
            const big = { name: BIG_DEFAULT_NAME, username: me.username || BIG_DEFAULT_USERNAME, passwordHash: me.passwordHash, role: 'bigsuperadmin', active: true, protected: true, createdAt: me.createdAt || Date.now(), resetAt: Date.now() };
            await db.ref('/').set({
                users: { [me.id]: big },
                config: { pricePerBag: 15000, company: { name: 'GlasirEs', address: '', phone: '', logo: '', reportColor: '#1c4a73' }, products: {} },
                warehouse: { stock: 0 },
                driverStock: {},
                customers: {},
                deliveries: {},
                stockRequests: {},
                returnRequests: {},
                invoiceCustomers: {},
                notifications: {},
                logs: {},
                dataRequests: {},
                priceChangeLogs: {}
            });
            localStorage.setItem('glasires_uid', me.id);
            setPassword('');
            show('RESET TOTAL BERHASIL. Database kembali kosong dan BIG SUPER ADMIN tetap aktif.');
            setTimeout(() => location.reload(), 900);
        }
        catch (e) {
            show('Reset gagal: ' + e.message, 'err');
        }
        setBusy(false);
    };
    const deleteUser = async (u) => {
        if (u.id === me.id || u.role === 'bigsuperadmin' || u.protected)
            return show('Akun BIG SUPER ADMIN dilindungi dan tidak dapat dihapus.', 'err');
        if (!confirm(`Hapus pengguna ${u.name} (${ROLES[u.role] || u.role})?`))
            return;
        try {
            await db.ref('users/' + u.id).remove();
            if (u.role === 'driver' && u.username)
                await db.ref('driverStock/' + u.username).remove();
            await createAudit('big_user_deleted', `BIG SUPER ADMIN menghapus ${u.name} (${ROLES[u.role] || u.role})`, me);
            show('Pengguna berhasil dihapus.');
        }
        catch (e) {
            show('Gagal menghapus: ' + e.message, 'err');
        }
    };
    const deleteNode = async (node, label) => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        if (!confirm(`Hapus seluruh data ${label}? Tindakan ini tidak dapat dibatalkan.`))
            return;
        try {
            await db.ref(node).remove();
            await createAudit('big_node_deleted', `BIG SUPER ADMIN menghapus node ${node}`, me);
            show(`${label} berhasil dihapus.`);
        }
        catch (e) {
            show('Gagal menghapus: ' + e.message, 'err');
        }
    };
    // Menghapus stok driver total (lama) SEKALIGUS stok per jenis produk,
    // supaya diagram "Total Stok Dibawa" dan "Stok per Jenis Produk" di Beranda
    // Driver benar-benar kembali ke 0, bukan hanya salah satu node saja.
    const deleteDriverStock = async () => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        if (!confirm('Hapus seluruh Stok Driver (total & per jenis produk)? Tindakan ini tidak dapat dibatalkan.'))
            return;
        try {
            await db.ref('driverStock').remove();
            await db.ref('driverStockByProduct').remove();
            await createAudit('big_node_deleted', 'BIG SUPER ADMIN menghapus node driverStock & driverStockByProduct', me);
            show('Stok Driver (total & per jenis produk) berhasil dihapus.');
        }
        catch (e) {
            show('Gagal menghapus: ' + e.message, 'err');
        }
    };
    const deleteDataRequest = async (r) => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        if (!confirm(`Hapus data permintaan ${r.title || 'Data Produk & Harga'} dari ${r.submittedByName || 'Admin'}?`))
            return;
        try {
            await db.ref('dataRequests/' + r.id).remove();
            await createAudit('big_data_request_deleted', `BIG menghapus permintaan data ${r.id} (${r.status || 'pending'})`, me);
            show('Data permintaan berhasil dihapus.');
        }
        catch (e) {
            show('Gagal menghapus: ' + e.message, 'err');
        }
    };
    const resetDataRequestsByStatus = async (status) => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        const rows = dataRequests.filter(r => r.status === status);
        if (!rows.length)
            return show(`Tidak ada data ${status === 'approved' ? 'ACC' : 'REJECT'} untuk dihapus.`, 'err');
        if (!confirm(`Hapus semua data permintaan yang berstatus ${status === 'approved' ? 'ACC / APPROVE' : 'REJECT / TOLAK'} (${rows.length} data)?`))
            return;
        try {
            await Promise.all(rows.map(r => db.ref('dataRequests/' + r.id).remove()));
            await createAudit('big_data_request_reset', `BIG menghapus ${rows.length} permintaan status ${status}`, me);
            show(`${rows.length} data berhasil dihapus.`);
        }
        catch (e) {
            show('Gagal menghapus: ' + e.message, 'err');
        }
    };
    const updateWarehouseStock = async (mode) => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        const n = Number(stockEdit);
        if (!Number.isFinite(n) || n < 0)
            return show('Jumlah stok tidak valid.', 'err');
        try {
            if (mode === 'set')
                await db.ref('warehouse/stock').set(Math.floor(n));
            if (mode === 'add')
                await db.ref('warehouse/stock').transaction(v => (v || 0) + Math.floor(n));
            if (mode === 'subtract')
                await db.ref('warehouse/stock').transaction(v => Math.max(0, (v || 0) - Math.floor(n)));
            setStockEdit('');
            show('Stok gudang berhasil diperbarui oleh BIG SUPER ADMIN. PERUBAHAN INI TIDAK DICATAT DI RIWAYAT GUDANG ATAU AUDIT LOG.');
        }
        catch (e) {
            show('Gagal memperbarui stok: ' + e.message, 'err');
        }
    };
    const clearWarehouseStock = async () => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        if (!confirm(`Hapus seluruh stok gudang (total & per jenis produk)? Stok saat ini ${warehouseStock} kantong akan menjadi 0.`))
            return;
        try {
            await db.ref('warehouse/stock').set(0);
            await db.ref('warehouse/stockByProduct').remove();
            show('Stok gudang (total & per jenis produk) berhasil dikosongkan oleh BIG SUPER ADMIN. PERUBAHAN INI TIDAK DICATAT DI RIWAYAT GUDANG ATAU AUDIT LOG.');
        }
        catch (e) {
            show('Gagal menghapus stok: ' + e.message, 'err');
        }
    };
    // Hapus data stok gudang HANYA untuk satu jenis produk yang dipilih (tidak semua produk).
    // Total stok gudang ikut dikurangi sebesar stok produk tersebut supaya angka totalnya tetap sesuai.
    const deleteWarehouseStockByProductId = async () => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        if (!deleteStockProductId)
            return show('Pilih jenis produk yang stoknya ingin dihapus.', 'err');
        const product = products.find(p => p.id === deleteStockProductId);
        const current = Number(warehouseStockByProduct[deleteStockProductId] || 0);
        if (!confirm(`Hapus stok gudang untuk jenis produk "${(product === null || product === void 0 ? void 0 : product.name) || deleteStockProductId}"? Stok saat ini ${current} kantong akan menjadi 0.`))
            return;
        try {
            await db.ref('warehouse/stock').transaction(v => Math.max(0, Number(v || 0) - current));
            await db.ref('warehouse/stockByProduct/' + deleteStockProductId).remove();
            await createAudit('big_node_deleted', `BIG SUPER ADMIN menghapus stok gudang untuk produk ${(product === null || product === void 0 ? void 0 : product.name) || deleteStockProductId} (${current} kantong)`, me);
            setDeleteStockProductId('');
            show(`Stok gudang untuk ${(product === null || product === void 0 ? void 0 : product.name) || 'produk'} berhasil dihapus.`);
        }
        catch (e) {
            show('Gagal menghapus stok: ' + e.message, 'err');
        }
    };
    const deleteAllProducts = async () => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        const snap = await db.ref('config/products').once('value');
        const allProducts = toList(snap.val());
        if (!allProducts.length)
            return show('Tidak ada jenis produk untuk dihapus.', 'err');
        if (!confirm(`⚠️ HAPUS SEMUA JENIS PRODUK\n\nAkan menghapus langsung ${allProducts.length} jenis produk dari Firebase Database.\n\nData produk aktif/nonaktif di config/products akan dihapus permanen.\n\nLanjutkan?`))
            return;
        const ok = prompt('Ketik HAPUS PRODUK untuk konfirmasi:');
        if (ok !== 'HAPUS PRODUK') {
            show('Penghapusan jenis produk dibatalkan.', 'err');
            return;
        }
        try {
            await db.ref('config/products').remove();
            await createAudit('big_products_deleted', `BIG SUPER ADMIN menghapus seluruh jenis produk (${allProducts.length} produk) dari database`, me);
            show(`${allProducts.length} jenis produk berhasil dihapus langsung dari database.`);
        }
        catch (e) {
            show('Gagal menghapus jenis produk: ' + e.message, 'err');
        }
    };
    // Hapus HANYA satu jenis produk yang dipilih dari config/products (tidak menghapus semuanya).
    const deleteSingleProduct = async () => {
        if (!await verifyBig()) {
            show('Password BIG SUPER ADMIN salah.', 'err');
            return;
        }
        if (!deleteProductId)
            return show('Pilih jenis produk yang ingin dihapus.', 'err');
        const product = products.find(p => p.id === deleteProductId);
        if (!confirm(`⚠️ HAPUS JENIS PRODUK\n\nAkan menghapus langsung "${(product === null || product === void 0 ? void 0 : product.name) || deleteProductId}" dari Firebase Database (config/products).\n\nLanjutkan?`))
            return;
        const ok = prompt('Ketik HAPUS PRODUK untuk konfirmasi:');
        if (ok !== 'HAPUS PRODUK') {
            show('Penghapusan jenis produk dibatalkan.', 'err');
            return;
        }
        try {
            await db.ref('config/products/' + deleteProductId).remove();
            await createAudit('big_product_deleted', `BIG SUPER ADMIN menghapus jenis produk ${(product === null || product === void 0 ? void 0 : product.name) || deleteProductId} dari database`, me);
            setDeleteProductId('');
            show(`Jenis produk ${(product === null || product === void 0 ? void 0 : product.name) || ''} berhasil dihapus langsung dari database.`);
        }
        catch (e) {
            show('Gagal menghapus jenis produk: ' + e.message, 'err');
        }
    };
    const changePassword = async () => {
        if (!newPassword || newPassword.length < 8)
            return show('Password baru minimal 8 karakter.', 'err');
        if (newPassword !== confirmPassword)
            return show('Konfirmasi password tidak sama.', 'err');
        if (!await verifyBig())
            return show('Password saat ini salah.', 'err');
        try {
            const hash = await sha256(newPassword);
            await db.ref('users/' + me.id).update({ passwordHash: hash, passwordChangedAt: Date.now() });
            show('Password BIG SUPER ADMIN berhasil diubah.');
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        catch (e) {
            show('Gagal mengubah password: ' + e.message, 'err');
        }
    };
    const counts = [
        ['Pengguna', users.length, '👥'],
        ['Pengantaran', deliveries.length, '🧊'],
        ['Permintaan Stok', stockRequests.length, '📦'],
        ['Pengembalian', returns.length, '↩️'],
        ['Invoice', invoices.length, '🧾'],
        ['Notifikasi', notifications.length, '🔔'],
        ['Log Audit', logs.length, '🛡️'],
        ['Riwayat Gudang', warehouseHistory.length, '🏭'],
    ];
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("div", { className: "big-admin-card rounded-3xl p-6 lg:p-8 mb-6" },
            React.createElement("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-5" },
                React.createElement("div", null,
                    React.createElement("div", { className: "text-xs tracking-[.22em] text-frost-300 font-bold" }, "SYSTEM CONTROL CENTER"),
                    React.createElement("h2", { className: "font-display text-2xl lg:text-3xl font-extrabold mt-2" }, "\uD83D\uDC51 BIG SUPER ADMIN"),
                    React.createElement("p", { className: "text-sm text-frost-200/75 mt-2 max-w-2xl" }, "Akses tertinggi untuk reset database dan pengelolaan akun. Fitur ini dibuat terpisah agar fungsi Admin, Super Admin, Driver, dan Gudang yang sudah ada tetap berjalan seperti sebelumnya.")),
                React.createElement("div", { className: "rounded-2xl bg-white/10 border border-white/15 px-4 py-3 min-w-[220px]" },
                    React.createElement("div", { className: "text-xs text-frost-200/60" }, "AKUN AKTIF"),
                    React.createElement("b", { className: "block text-white mt-1" }, me.name),
                    React.createElement("span", { className: "text-xs text-frost-300" },
                        "@",
                        me.username),
                    React.createElement(Btn, { tone: "ghost", className: "w-full mt-3 !bg-white/10 !text-white !border-white/15", onClick: keluarBig }, "Keluar")))),
        React.createElement("div", { className: "flex flex-wrap gap-2 mb-5" }, [
            ['dashboard', '📊 Dashboard'],
            ['users', '👥 Semua User'],
            ['danger', '☢️ Reset Database'],
            ['security', '🔐 Keamanan']
        ].map(x => React.createElement("button", { key: x[0], onClick: () => setTab(x[0]), className: 'px-4 py-2.5 rounded-2xl text-sm font-semibold border transition ' + (tab === x[0] ? 'bg-glacier-900 text-white border-glacier-900' : 'bg-white text-glacier-700 border-slate-200') }, x[1]))),
        tab === 'dashboard' && React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4" },
            counts.map(c => React.createElement(Card, { key: c[0] },
                React.createElement("div", { className: "text-2xl" }, c[2]),
                React.createElement("div", { className: "text-xs text-slate-400 mt-2" }, c[0]),
                React.createElement("b", { className: "font-display text-2xl text-glacier-900" }, c[1].toLocaleString('id-ID')))),
            React.createElement(Card, { className: "sm:col-span-2 lg:col-span-4" },
                React.createElement("div", { className: "font-semibold mb-3" }, "Ringkasan Role"),
                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3" }, ['bigsuperadmin', 'superadmin', 'admin', 'driver', 'gudang'].map(r => React.createElement("div", { key: r, className: "p-4 rounded-2xl bg-slate-50 border" },
                    React.createElement("div", { className: "text-xs text-slate-500" }, ROLES[r]),
                    React.createElement("b", { className: "text-xl" }, users.filter(u => u.role === r).length)))))),
        tab === 'users' && React.createElement(Card, null,
            React.createElement("div", { className: "flex flex-wrap justify-between gap-3 mb-4" },
                React.createElement("div", null,
                    React.createElement("b", { className: "text-lg" }, "Semua Pengguna"),
                    React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "BIG SUPER ADMIN dapat menghapus akun Admin, Super Admin, Driver, dan Gudang.")),
                React.createElement(Pill, null,
                    users.length,
                    " user")),
            React.createElement("div", { className: "space-y-2" }, users.sort((a, b) => (a.role === 'bigsuperadmin' ? -1 : 1) - (b.role === 'bigsuperadmin' ? -1 : 1)).map(u => React.createElement("div", { key: u.id, className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-white/70" },
                React.createElement("div", null,
                    React.createElement("b", null, u.name),
                    React.createElement("div", { className: "text-xs text-slate-500" },
                        "@",
                        u.username,
                        " \u00B7 ",
                        ROLES[u.role] || u.role)),
                React.createElement("div", { className: "flex items-center gap-2" }, u.role === 'bigsuperadmin' ? React.createElement(Pill, { tone: "approved" }, "DILINDUNGI") : React.createElement(Btn, { tone: "danger", className: "!px-3 !py-2 text-xs", onClick: () => deleteUser(u) }, "\uD83D\uDDD1 Hapus")))))),
        tab === 'danger' && React.createElement("div", { className: "space-y-5" },
            React.createElement(Card, { className: "big-danger-zone" },
                React.createElement("div", { className: "flex flex-col lg:flex-row gap-5 justify-between" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-display font-extrabold text-xl text-rose-700" }, "\u2622\uFE0F RESET TOTAL DATABASE"),
                        React.createElement("p", { className: "text-sm text-slate-600 mt-2 max-w-3xl" }, "Menghapus seluruh isi database aplikasi dan membuat ulang struktur awal. Semua Admin, Super Admin, Driver, Gudang, pelanggan, transaksi, stok, invoice, notifikasi, laporan, dan log akan dihapus."),
                        React.createElement("p", { className: "text-xs text-rose-600 font-semibold mt-3" }, "BIG SUPER ADMIN tetap dibuat kembali agar sistem tidak terkunci setelah reset.")),
                    React.createElement("div", { className: "w-full lg:w-72" },
                        React.createElement(Field, { label: "Password BIG SUPER ADMIN untuk menjalankan reset" },
                            React.createElement("input", { type: "password", className: inputCls, value: password, onChange: e => setPassword(e.target.value), placeholder: "Masukkan password" })),
                        React.createElement(Btn, { tone: "danger", className: "w-full", disabled: busy, onClick: resetDatabase }, busy ? '⏳ Sedang mereset…' : '☢️ RESET SEMUA DATA')))),
            React.createElement(Card, null,
                React.createElement("b", { className: "block mb-4" }, "Hapus Node Data Secara Terpisah"),
                React.createElement("div", { className: "grid big-admin-grid md:grid-cols-2 lg:grid-cols-3 gap-3" }, [
                    ['deliveries', 'Riwayat Pengantaran'],
                    ['stockRequests', 'Permintaan Stok'],
                    ['returnRequests', 'Pengembalian Stok'],
                    ['invoiceCustomers', 'Data Invoice'],
                    ['notifications', 'Notifikasi'],
                    ['logs', 'Log Audit'],
                    ['customers', 'Data Pelanggan'],
                    ['warehouse/history', 'Riwayat Gudang'],
                    ['driverStock', 'Stok Driver (Total & Per Produk)'],
                    ['priceChangeLogs', 'Laporan Perubahan Produk & Harga']
                ].map(([node, label]) => React.createElement("button", { key: node, className: "big-action border bg-white hover:bg-rose-50", onClick: () => node === 'driverStock' ? deleteDriverStock() : deleteNode(node, label) },
                    React.createElement("div", { className: "font-semibold text-slate-800" },
                        "\uD83D\uDDD1 ",
                        label),
                    React.createElement("div", { className: "text-xs text-slate-400 mt-1" },
                        "Node: ",
                        node,
                        node === 'driverStock' ? ' + driverStockByProduct' : ''))))),
            React.createElement(Card, { className: "big-danger-zone" },
                React.createElement("div", { className: "flex flex-col lg:flex-row gap-5 justify-between" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-display font-extrabold text-xl text-rose-700" }, "\uD83E\uDDCA HAPUS SEMUA JENIS PRODUK"),
                        React.createElement("p", { className: "text-sm text-slate-600 mt-2 max-w-3xl" },
                            "Khusus BIG SUPER ADMIN. Menghapus langsung seluruh node ",
                            React.createElement("b", null, "config/products"),
                            " dari Firebase Database. Data produk tidak lagi tersedia untuk Admin, Super Admin, Driver, atau Gudang sampai dibuat kembali.")),
                    React.createElement("div", { className: "w-full lg:w-72" },
                        React.createElement(Btn, { tone: "danger", className: "w-full", onClick: deleteAllProducts }, "\uD83D\uDDD1 HAPUS SEMUA JENIS PRODUK"))),
                React.createElement("div", { className: "mt-5 pt-5 border-t border-rose-200" },
                    React.createElement("b", { className: "block text-sm text-rose-700 mb-2" }, "Atau hapus satu jenis produk saja"),
                    React.createElement("p", { className: "text-xs text-slate-500 mb-3" }, "Pilih satu jenis produk untuk dihapus langsung dari database, tanpa menghapus jenis produk yang lain."),
                    React.createElement("div", { className: "grid sm:grid-cols-[1fr_auto] gap-2" },
                        React.createElement(Field, { label: "Pilih Jenis Produk" },
                            React.createElement("select", { className: inputCls, value: deleteProductId, onChange: e => setDeleteProductId(e.target.value) },
                                React.createElement("option", { value: "" }, "\u2014 Pilih jenis produk \u2014"),
                                products.map(p => React.createElement("option", { key: p.id, value: p.id },
                                    p.name,
                                    p.active === false ? ' (nonaktif)' : '')))),
                        React.createElement(Btn, { tone: "danger", onClick: deleteSingleProduct }, "\uD83D\uDDD1 HAPUS PRODUK INI")),
                    !products.length && React.createElement("div", { className: "text-xs text-slate-400 mt-2" }, "Belum ada jenis produk di database."))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
                    React.createElement("div", null,
                        React.createElement("b", null, "DATA PERMINTAAN \u2014 ACC & REJECT"),
                        React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "BIG SUPER ADMIN dapat menghapus data permintaan yang sudah ACC maupun REJECT secara terpisah.")),
                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                        React.createElement(Btn, { tone: "danger", className: "!text-xs", onClick: () => resetDataRequestsByStatus('approved') }, "\uD83D\uDDD1 HAPUS SEMUA ACC"),
                        React.createElement(Btn, { tone: "danger", className: "!text-xs", onClick: () => resetDataRequestsByStatus('rejected') }, "\uD83D\uDDD1 HAPUS SEMUA REJECT"))),
                React.createElement("div", { className: "space-y-2 max-h-[430px] overflow-y-auto" },
                    dataRequests.filter(r => r.status === 'approved' || r.status === 'rejected').map(r => React.createElement("div", { key: r.id, className: "p-4 rounded-2xl border bg-white/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("b", null, r.title || 'DATA PRODUK & HARGA'),
                            React.createElement("div", { className: "text-xs text-slate-500 mt-1" },
                                r.submittedByName || '-',
                                " \u00B7 ",
                                waktu(r.submittedAt)),
                            React.createElement("div", { className: "text-xs mt-1" }, (r.products || []).map(p => p.name).join(', ') || '-')),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(Pill, { tone: r.status === 'approved' ? 'approved' : 'rejected' }, r.status === 'approved' ? 'ACC / APPROVE' : 'REJECT / TOLAK'),
                            React.createElement(Btn, { tone: "danger", className: "!px-3 !py-2 text-xs", onClick: () => deleteDataRequest(r) }, "Hapus")))),
                    !dataRequests.some(r => r.status === 'approved' || r.status === 'rejected') && React.createElement("div", { className: "text-center text-slate-400 py-8" }, "Belum ada data permintaan ACC atau REJECT."))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
                    React.createElement("div", null,
                        React.createElement("b", null, "STOK GUDANG"),
                        React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Edit, tambah, kurangi, atau kosongkan jumlah stok gudang.")),
                    React.createElement("div", { className: "text-3xl font-display font-extrabold text-glacier-900" },
                        Math.round(warehouseStock || 0).toLocaleString('id-ID'),
                        " ",
                        React.createElement("span", { className: "text-sm font-normal" }, "KANTONG"))),
                React.createElement("div", { className: "grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end" },
                    React.createElement(Field, { label: "JUMLAH STOK" },
                        React.createElement("input", { type: "number", min: "0", className: inputCls, value: stockEdit, onChange: e => setStockEdit(e.target.value), placeholder: "Masukkan jumlah" })),
                    React.createElement(Btn, { tone: "accent", onClick: () => updateWarehouseStock('set') }, "\u270F\uFE0F EDIT / SET"),
                    React.createElement(Btn, { tone: "ghost", onClick: () => updateWarehouseStock('add') }, "\uFF0B TAMBAH"),
                    React.createElement(Btn, { tone: "ghost", onClick: () => updateWarehouseStock('subtract') }, "\u2212 KURANGI"),
                    React.createElement(Btn, { tone: "danger", onClick: clearWarehouseStock }, "\uD83D\uDDD1 HAPUS STOK")),
                React.createElement("div", { className: "text-xs text-slate-400 mt-3" }, "SET = mengganti stok menjadi jumlah yang dimasukkan. TAMBAH/KURANGI = menyesuaikan stok saat ini. Perubahan oleh BIG SUPER ADMIN tidak dicatat di riwayat gudang maupun audit log."),
                React.createElement("div", { className: "mt-5 pt-5 border-t" },
                    React.createElement("b", { className: "block text-sm mb-2" }, "Atau hapus stok satu jenis produk saja"),
                    React.createElement("p", { className: "text-xs text-slate-500 mb-3" }, "Pilih satu jenis produk untuk dikosongkan stok gudangnya, tanpa mengganggu stok jenis produk lain. Total stok gudang ikut disesuaikan."),
                    React.createElement("div", { className: "grid sm:grid-cols-[1fr_auto] gap-2" },
                        React.createElement(Field, { label: "Pilih Jenis Produk" },
                            React.createElement("select", { className: inputCls, value: deleteStockProductId, onChange: e => setDeleteStockProductId(e.target.value) },
                                React.createElement("option", { value: "" }, "\u2014 Pilih jenis produk \u2014"),
                                products.map(p => React.createElement("option", { key: p.id, value: p.id },
                                    p.name,
                                    " \u2014 ",
                                    Number(warehouseStockByProduct[p.id] || 0).toLocaleString('id-ID'),
                                    " kantong")))),
                        React.createElement(Btn, { tone: "danger", onClick: deleteWarehouseStockByProductId }, "\uD83D\uDDD1 HAPUS STOK PRODUK INI")),
                    !products.length && React.createElement("div", { className: "text-xs text-slate-400 mt-2" }, "Belum ada jenis produk di database.")))),
        tab === 'security' && React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" },
            React.createElement(Card, null,
                React.createElement("h3", { className: "font-bold mb-1" }, "\uD83D\uDD10 Ganti Password BIG SUPER ADMIN"),
                React.createElement("p", { className: "text-xs text-slate-500 mb-4" }, "Disarankan mengganti password bawaan setelah login pertama."),
                React.createElement(Field, { label: "Password saat ini" },
                    React.createElement("input", { type: "password", className: inputCls, value: password, onChange: e => setPassword(e.target.value) })),
                React.createElement(Field, { label: "Password baru" },
                    React.createElement("input", { type: "password", className: inputCls, value: newPassword, onChange: e => setNewPassword(e.target.value), placeholder: "Minimal 8 karakter" })),
                React.createElement(Field, { label: "Ulangi password baru" },
                    React.createElement("input", { type: "password", className: inputCls, value: confirmPassword, onChange: e => setConfirmPassword(e.target.value) })),
                React.createElement(Btn, { tone: "accent", className: "w-full", onClick: changePassword }, "Simpan Password Baru")),
            React.createElement(Card, null,
                React.createElement("h3", { className: "font-bold mb-3" }, "\uD83D\uDEE1\uFE0F Perlindungan BIG"),
                React.createElement("div", { className: "space-y-3 text-sm" },
                    React.createElement("div", { className: "p-3 rounded-xl bg-emerald-50 border border-emerald-100" }, "\u2713 Akun BIG tidak ikut terhapus saat reset total."),
                    React.createElement("div", { className: "p-3 rounded-xl bg-emerald-50 border border-emerald-100" }, "\u2713 BIG dapat menghapus akun role lain."),
                    React.createElement("div", { className: "p-3 rounded-xl bg-amber-50 border border-amber-100" }, "\u26A0\uFE0F Reset total memerlukan password + konfirmasi kedua."),
                    React.createElement("div", { className: "p-3 rounded-xl bg-slate-50 border" },
                        "Username bawaan: ",
                        React.createElement("b", null, BIG_DEFAULT_USERNAME))))));
}
