function StockOverview() { const ws = useDbValue('warehouse/stock', 0), ds = useDbList('driverStock'), dsByProduct = useDbList('driverStockByProduct'), us = toList(useDbList('users')), drivers = us.filter(u => u.role === 'driver'), driverCarried = d => { const byP = dsByProduct[d.id], vals = byP ? Object.values(byP).map(v => Number(v || 0)) : []; return vals.length ? vals.reduce((a, b) => a + b, 0) : Number(ds[d.username] || 0); }, car = drivers.reduce((a, d) => a + driverCarried(d), 0); return React.createElement("div", { className: "grid md:grid-cols-2 gap-5 mb-6" },
    React.createElement(Card, null,
        React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "STOK GUDANG"),
        React.createElement(IceGauge, { label: "Sisa es di gudang", value: ws, max: Math.max(ws, car, 100), big: true })),
    React.createElement(Card, null,
        React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "DIBAWA DRIVER"),
        React.createElement(IceGauge, { label: "Total sedang dibawa", value: car, max: Math.max(ws, car, 100), big: true }),
        React.createElement("div", { className: "mt-4 space-y-2" }, drivers.map(d => React.createElement("div", { key: d.id, className: "flex justify-between text-sm" },
            React.createElement("span", null, d.name),
            React.createElement("b", null,
                driverCarried(d),
                " kantong")))))); }
function ApprovalStockDiagram() {
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const stock = Number(useDbValue('warehouse/stock', 0) || 0);
    const stockByProduct = useDbList('warehouse/stockByProduct');
    const values = products.map(p => Number(stockByProduct[p.id] || 0));
    const maxProduct = Math.max(100, stock, ...values);
    return React.createElement(Card, { className: "mb-5" },
        React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4" },
            React.createElement("div", null,
                React.createElement("div", { className: "font-semibold" }, "Diagram Stok per Jenis Produk"),
                React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Stok gudang saat ini berdasarkan jenis produk")),
            React.createElement(Pill, null, stock.toLocaleString('id-ID') + " kantong total")),
        React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" },
            products.map(p => {
                const value = Number(stockByProduct[p.id] || 0);
                return React.createElement("div", { key: p.id, className: "p-4 rounded-2xl border bg-white/70" },
                    React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "STOK PRODUK"),
                    React.createElement("div", { className: "font-semibold mb-3 truncate", title: p.name }, p.name),
                    React.createElement(IceGauge, { label: "Sisa stok gudang", value: value, max: maxProduct }),
                    React.createElement("div", { className: "mt-3 text-xs text-slate-500" },
                        "Persentase dari total: ",
                        stock > 0 ? Math.round(value / stock * 100) : 0,
                        "%"));
            }),
            !products.length && React.createElement("div", { className: "text-sm text-slate-400 py-4" }, "Belum ada jenis produk aktif.")));
}
function DeliveriesTable({ filterUser = '', paymentFilter = '' }) { const ds = toList(useDbList('deliveries')).filter(d => (!filterUser || d.driverId === filterUser) && (!paymentFilter || d.paymentMethod === paymentFilter)).sort((a, b) => b.timestamp - a.timestamp); return React.createElement(Card, null,
    React.createElement("div", { className: "font-semibold mb-4" },
        "Riwayat Pengantaran (",
        ds.length,
        ")"),
    React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("table", { className: "w-full text-sm" },
            React.createElement("thead", null,
                React.createElement("tr", { className: "text-left text-slate-400 text-xs border-b" },
                    React.createElement("th", { className: "py-2" }, "Waktu"),
                    React.createElement("th", null, "Driver"),
                    React.createElement("th", null, "Pelanggan"),
                    React.createElement("th", null, "Lokasi"),
                    React.createElement("th", null, "Qty"),
                    React.createElement("th", null, "Total"),
                    React.createElement("th", null, "Pembayaran"),
                    React.createElement("th", null, "Status"))),
            React.createElement("tbody", null, ds.map(d => React.createElement("tr", { key: d.id, className: "border-b border-slate-100" },
                React.createElement("td", { className: "py-2 text-xs" }, waktu(d.timestamp)),
                React.createElement("td", null, d.driverName),
                React.createElement("td", null, d.customerNameFull || d.customerName || '-'),
                React.createElement("td", null, d.locationFull || d.location || '-'),
                React.createElement("td", null, d.qty),
                React.createElement("td", null, rupiah(d.total)),
                React.createElement("td", null, d.paymentMethod === 'invoice' ? 'INVOICE' : d.paymentMethod === 'wait_cash' ? 'WAIT CASH' : 'CASH'),
                React.createElement("td", null, d.paymentMethod === 'invoice' ? (d.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS') : d.paymentMethod === 'wait_cash' ? (d.paymentStatus === 'paid' ? 'LUNAS' : 'WAIT CASH') : 'LUNAS'))))))); }
function ApproveRequests({ me }) {
    const rs = toList(useDbList('stockRequests')).sort((a, b) => (a.requestedForDate || '').localeCompare(b.requestedForDate || '') || (b.requestedAt - a.requestedAt)), [toast, show] = useToast();
    const act = async (r, status) => {
        await db.ref('stockRequests/' + r.id).update({ status: status === 'approved' ? 'admin_approved' : 'rejected', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() });
        const tgl = r.requestedForDate ? new Date(r.requestedForDate + 'T00:00:00').toLocaleDateString('id-ID') : 'hari ini';
        await notify({ title: status === 'approved' ? 'Permintaan stok disetujui' : 'Permintaan stok ditolak', message: `Permintaan ${r.qtyRequested} kantong dari ${r.driverName} untuk ${tgl} ${status === 'approved' ? 'telah di-ACC.' : 'ditolak.'}`, type: status, toUser: r.driverId, fromUser: me.id, data: { requestId: r.id }, menu: 'request' });
        if (status === 'approved')
            await notify({ title: 'Permintaan stok sudah di-ACC Admin', message: `${r.qtyRequested} kantong ${r.productName || 'produk'} dari ${r.driverName} sudah di-ACC Admin dan sekarang MENUNGGU GUDANG.`, toRole: 'gudang', fromUser: me.id, data: { requestId: r.id, requestedForDate: r.requestedForDate, productId: r.productId }, menu: 'release' });
        await createAudit('stock_request_' + status, `${r.driverName} ${r.qtyRequested} kantong untuk ${tgl}`, me);
        show(status === 'approved' ? 'Permintaan disetujui dan Gudang diberi notifikasi.' : 'Permintaan ditolak.', status === 'approved' ? 'ok' : 'err');
    };
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Persetujuan Permintaan Stok"),
        React.createElement(ApprovalStockDiagram, null),
        React.createElement(Card, null,
            React.createElement("div", { className: "font-semibold mb-4" }, "Menunggu Persetujuan Admin"),
            React.createElement("div", { className: "space-y-2" },
                rs.filter(r => r.status === 'pending').map(r => React.createElement("div", { key: r.id, className: "flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 p-4 rounded-xl border bg-amber-50" },
                    React.createElement("div", null,
                        React.createElement("b", null, r.driverName),
                        React.createElement("div", { className: "text-sm font-semibold text-sky-700" },
                            r.productName || 'Es Kristal',
                            " \u00B7 ",
                            r.qtyRequested,
                            " kantong \u00B7 Dibutuhkan: ",
                            r.requestedForDate ? new Date(r.requestedForDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'),
                        React.createElement("div", { className: "text-xs text-slate-500" },
                            "Permintaan dibuat: ",
                            waktu(r.requestedAt))),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(Btn, { tone: "accent", onClick: () => act(r, 'approved') }, "\u2713 ACC"),
                        React.createElement(Btn, { tone: "danger", onClick: () => act(r, 'rejected') }, "Tolak")))),
                !rs.some(r => r.status === 'pending') && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Tidak ada permintaan."))));
}
function ManageUsers({ me, roles, title }) {
    const users = toList(useDbList('users')), [name, setN] = useState(''), [un, setU] = useState(''), [pw, setP] = useState(''), [role, setR] = useState(roles[0]), [toast, show] = useToast();
    const list = users.filter(u => roles.includes(u.role));
    const add = async () => {
        const cleanName = String(name || '').trim().replace(/\s+/g, ' ');
        const cleanUsername = String(un || '').trim();
        if (!cleanName || !cleanUsername || !pw)
            return show('Lengkapi data.', 'err');
        if (cleanUsername.length < 3)
            return show('Username minimal 3 karakter.', 'err');
        if (users.some(u => String(u.username || '').trim().toLowerCase() === cleanUsername.toLowerCase()))
            return show('Username sudah dipakai.', 'err');
        try {
            const r = await db.ref('users').push({
                name: cleanName,
                username: cleanUsername,
                passwordHash: await sha256(pw),
                role,
                active: true,
                createdAt: Date.now(),
                createdBy: me.id,
                createdByName: me.name
            });
            if (role === 'driver') {
                await db.ref('driverStock/' + cleanUsername).set(0);
                await db.ref('driverStockByProduct/' + r.key).set({});
            }
            await notify({ title: 'User baru ditambahkan', message: `${cleanName} (${ROLES[role]}) telah dibuat oleh ${me.name}`, toRole: 'superadmin', fromUser: me.id, menu: (role === 'admin' ? 'admins' : 'users') });
            await createAudit('user_created', `Membuat ${cleanName} (${ROLES[role]}) dengan username ${cleanUsername}`, me);
            show('User berhasil ditambahkan.');
            setN('');
            setU('');
            setP('');
        }
        catch (e) {
            show('Gagal menambahkan user: ' + e.message, 'err');
        }
    };
    const del = async (u) => {
        if (u.id === me.id)
            return show('Akun sendiri tidak dapat dihapus.', 'err');
        if (!confirm(`Hapus ${u.name}?`))
            return;
        try {
            await db.ref('users/' + u.id).remove();
            if (u.role === 'driver') {
                await db.ref('driverStock/' + u.username).remove();
                await db.ref('driverStockByProduct/' + u.id).remove();
            }
            await createAudit('user_deleted', `Menghapus ${u.name} (${ROLES[u.role]})`, me);
            show('User dihapus.');
        }
        catch (e) {
            show('Gagal menghapus user: ' + e.message, 'err');
        }
    };
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, title),
        React.createElement("div", { className: "grid lg:grid-cols-5 gap-5" },
            React.createElement(Card, { className: "lg:col-span-2" },
                React.createElement("b", { className: "block mb-2" }, "Tambah Pengguna"),
                React.createElement("p", { className: "text-xs text-slate-500 mb-4" }, "Username dan nama boleh menggunakan huruf kecil maupun huruf besar. Sistem tidak lagi memaksa huruf menjadi kapital."),
                React.createElement("div", { className: "user-manage-input" },
                    React.createElement(Field, { label: "Nama" },
                        React.createElement("input", { className: inputCls + ' user-manage-input', value: name, onChange: e => setN(e.target.value), autoCapitalize: "off", autoCorrect: "off" })),
                    React.createElement(Field, { label: "Username" },
                        React.createElement("input", { className: inputCls + ' user-manage-input', value: un, onChange: e => setU(e.target.value), autoCapitalize: "off", autoCorrect: "off", spellCheck: "false" })),
                    React.createElement(Field, { label: "Password" },
                        React.createElement("input", { type: "password", className: inputCls + ' user-manage-input', value: pw, onChange: e => setP(e.target.value) })),
                    roles.length > 1 && React.createElement(Field, { label: "Peran" },
                        React.createElement("select", { className: inputCls + ' user-manage-input', value: role, onChange: e => setR(e.target.value) }, roles.map(r => React.createElement("option", { key: r, value: r }, ROLES[r] || r))))),
                React.createElement(Btn, { tone: "accent", className: "w-full", onClick: add }, "Tambah Pengguna")),
            React.createElement(Card, { className: "lg:col-span-3" },
                React.createElement("b", null,
                    "Daftar Pengguna (",
                    list.length,
                    ")"),
                React.createElement("div", { className: "space-y-2 mt-4" },
                    list.map(u => React.createElement("div", { key: u.id, className: "flex justify-between items-center gap-3 p-3 border rounded-xl" },
                        React.createElement("div", null,
                            React.createElement("b", null, u.name),
                            React.createElement("div", { className: "text-xs text-slate-500" },
                                "@",
                                u.username)),
                        React.createElement("div", { className: "flex gap-2 items-center" },
                            React.createElement(Pill, null, ROLES[u.role]),
                            React.createElement(Btn, { tone: "danger", className: "!px-3 !py-1 text-xs", onClick: () => del(u) }, "Hapus")))),
                    !list.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada pengguna.")))));
}
function GudangHome({ me }) {
    const products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')), stock = useDbValue('warehouse/stock', 0), stockByProduct = useDbList('warehouse/stockByProduct'), [productId, setProductId] = useState(''), [q, setQ] = useState(''), [note, setNote] = useState(''), [toast, show] = useToast();
    const add = async () => {
        const n = +q;
        if (!productId)
            return show('Pilih jenis produk terlebih dahulu.', 'err');
        if (!Number.isInteger(n) || n < 1)
            return show('Jumlah tidak valid.', 'err');
        const product = products.find(p => p.id === productId);
        if (!product)
            return show('Jenis produk tidak ditemukan.', 'err');
        try {
            await db.ref('warehouse/stockByProduct/' + productId).transaction(v => (Number(v || 0) + n));
            await db.ref('warehouse/stock').transaction(v => (Number(v || 0) + n));
            await db.ref('warehouse/history').push({ type: 'masuk', qty: n, productId, productName: product.name, by: me.id, byName: me.name, note: String(note || '').trim(), timestamp: Date.now() });
            await notify({ title: 'Stok gudang bertambah', message: `${me.name} menambahkan ${n} kantong ${product.name} ke gudang.`, toRole: 'admin', fromUser: me.id, menu: 'overview' });
            await notify({ title: 'Stok gudang bertambah', message: `${me.name} menambahkan ${n} kantong ${product.name} ke gudang.`, toRole: 'superadmin', fromUser: me.id, menu: 'overview' });
            await createAudit('stock_in', `${n} kantong ${product.name}`, me);
            setProductId('');
            setQ('');
            setNote('');
            show(`Stok ${product.name} berhasil dicatat.`);
        }
        catch (e) {
            show('Gagal mencatat stok: ' + e.message, 'err');
        }
    };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Stok Gudang"),
        React.createElement(Card, { className: "mb-5" },
            React.createElement(IceGauge, { label: "Total sisa semua produk di gudang", value: stock, max: Math.max(stock, 100), big: true })),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("b", null, "Stok per Jenis Produk"),
            React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4" },
                products.map(p => React.createElement("div", { key: p.id, className: "p-4 rounded-2xl border bg-white/70" },
                    React.createElement("div", { className: "text-xs text-slate-500" }, "PRODUK"),
                    React.createElement("b", null, p.name),
                    React.createElement("div", { className: "text-2xl font-display mt-2" },
                        Number(stockByProduct[p.id] || 0).toLocaleString('id-ID'),
                        " ",
                        React.createElement("span", { className: "text-xs font-normal" }, "kantong")))),
                !products.length && React.createElement("div", { className: "text-sm text-slate-400" }, "Belum ada jenis produk aktif."))),
        React.createElement(Card, null,
            React.createElement("b", null, "Catat Stok Masuk"),
            React.createElement("div", { className: "grid sm:grid-cols-3 gap-3 mt-4" },
                React.createElement(Field, { label: "Jenis Produk" },
                    React.createElement("select", { className: inputCls, value: productId, onChange: e => setProductId(e.target.value) },
                        React.createElement("option", { value: "" }, "Pilih jenis produk"),
                        products.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name)))),
                React.createElement(Field, { label: "Jumlah Kantong" },
                    React.createElement("input", { type: "number", min: "1", className: inputCls, value: q, onChange: e => setQ(e.target.value) })),
                React.createElement(Field, { label: "Catatan" },
                    React.createElement("input", { className: inputCls, value: note, onChange: e => setNote(e.target.value) }))),
            React.createElement(Btn, { tone: "accent", onClick: add }, "Tambah Stok")));
}
function GudangRelease({ me }) {
    const rs = toList(useDbList('stockRequests')).filter(r => r.status === 'admin_approved' || r.status === 'fulfilled').sort((a, b) => (a.requestedForDate || '').localeCompare(b.requestedForDate || '') || (b.approvedAt || 0) - (a.approvedAt || 0)), products = toList(useDbList('config/products')).filter(p => p.active !== false), stock = useDbValue('warehouse/stock', 0), stockByProduct = useDbList('warehouse/stockByProduct'), [toast, show] = useToast(), today = tanggalLokal();
    const release = async (r) => {
        if (r.status === 'fulfilled')
            return show('Stok untuk permintaan ini sudah dikeluarkan.', 'err');
        if ((r.requestedForDate || today) !== today)
            return show('Stok hanya boleh dikeluarkan pada tanggal berjalan sesuai permintaan.', 'err');
        const product = products.find(p => p.id === r.productId);
        const available = r.productId ? Number(stockByProduct[r.productId] || 0) : Number(stock || 0);
        if (r.qtyRequested > available)
            return show(`Stok ${(product === null || product === void 0 ? void 0 : product.name) || r.productName || 'produk'} tidak cukup. Tersedia ${available} kantong.`, 'err');
        const s = await db.ref('users/' + r.driverId).once('value'), u = s.val();
        if (!(u === null || u === void 0 ? void 0 : u.username))
            return show('Driver tidak ditemukan.', 'err');
        try {
            if (r.productId)
                await db.ref('warehouse/stockByProduct/' + r.productId).transaction(v => Math.max(0, Number(v || 0) - r.qtyRequested));
            await db.ref('warehouse/stock').transaction(v => Math.max(0, Number(v || 0) - r.qtyRequested));
            if (r.productId)
                await db.ref('driverStockByProduct/' + r.driverId + '/' + r.productId).transaction(v => Number(v || 0) + r.qtyRequested);
            await db.ref('driverStock/' + u.username).transaction(v => Number(v || 0) + r.qtyRequested);
            await db.ref('stockRequests/' + r.id).update({ status: 'fulfilled', fulfilledBy: me.id, fulfilledByName: me.name, fulfilledAt: Date.now() });
            await db.ref('warehouse/history').push({ type: 'keluar', qty: r.qtyRequested, productId: r.productId || null, productName: r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'Es Kristal', driverId: r.driverId, driverName: r.driverName, stockRequestId: r.id, requestedForDate: r.requestedForDate, by: me.id, byName: me.name, timestamp: Date.now() });
            await notify({ title: 'Stok telah dikeluarkan', message: `${r.qtyRequested} kantong ${r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'produk'} telah diberikan kepada ${r.driverName}.`, toUser: r.driverId, fromUser: me.id, menu: 'request' });
            await createAudit('stock_release', `${r.qtyRequested} kantong ${r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'produk'} untuk ${r.driverName} (${r.requestedForDate || today})`, me);
            show(`Stok ${r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'produk'} dikeluarkan ke driver.`);
        }
        catch (e) {
            show('Gagal mengeluarkan stok: ' + e.message, 'err');
        }
    };
    const reject = async (r) => {
        if (r.status === 'fulfilled')
            return show('Stok untuk permintaan ini sudah dikeluarkan, tidak bisa ditolak.', 'err');
        const reason = prompt('Masukkan alasan penolakan permintaan stok:');
        if (reason === null)
            return;
        const clean = String(reason).trim();
        if (!clean)
            return show('Alasan penolakan wajib diisi.', 'err');
        try {
            await db.ref('stockRequests/' + r.id).update({ status: 'rejected', rejectReason: clean, rejectedBy: me.id, rejectedByName: me.name, rejectedAt: Date.now() });
            await notify({ title: 'Permintaan stok ditolak Gudang', message: `Permintaan ${r.qtyRequested} kantong ${r.productName || 'produk'} untuk ${r.driverName} ditolak Gudang. Alasan: ${clean}`, toUser: r.driverId, fromUser: me.id, data: { requestId: r.id, rejectReason: clean }, menu: 'request' });
            await notify({ title: 'Permintaan stok ditolak Gudang', message: `Permintaan ${r.qtyRequested} kantong ${r.productName || 'produk'} untuk ${r.driverName} ditolak Gudang. Alasan: ${clean}`, toRole: 'admin', fromUser: me.id, data: { requestId: r.id, rejectReason: clean }, menu: 'approve' });
            await createAudit('stock_request_rejected_gudang', `${r.qtyRequested} kantong ${r.productName || 'produk'} untuk ${r.driverName} ditolak Gudang: ${clean}`, me);
            show('Permintaan ditolak dan alasannya sudah dikirim ke Admin & Driver.');
        }
        catch (e) {
            show('Gagal menolak permintaan: ' + e.message, 'err');
        }
    };
    const dayRows = rs.filter(r => (r.requestedForDate || today) === today), futureRows = rs.filter(r => (r.requestedForDate || today) > today);
    const section = (title, rows, canRelease) => React.createElement("div", { className: "mb-6" },
        React.createElement("div", { className: "flex items-center justify-between mb-3" },
            React.createElement("b", null, title),
            React.createElement(Pill, null,
                rows.length,
                " permintaan")),
        React.createElement("div", { className: "space-y-2" },
            rows.map(r => React.createElement("div", { key: r.id, className: "p-4 rounded-xl border bg-white/70" },
                React.createElement("div", { className: "flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3" },
                    React.createElement("div", null,
                        React.createElement("b", null, r.driverName),
                        React.createElement("div", { className: "text-sm font-semibold text-sky-700" },
                            r.productName || 'Es Kristal',
                            " \u00B7 ",
                            r.qtyRequested,
                            " kantong \u00B7 Dibutuhkan: ",
                            r.requestedForDate ? new Date(r.requestedForDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'),
                        React.createElement("div", { className: "text-xs text-slate-500" },
                            "ACC Admin oleh ",
                            r.approvedByName || '-',
                            " \u00B7 ",
                            waktu(r.approvedAt)),
                        r.status === 'fulfilled' && React.createElement("div", { className: "text-xs text-emerald-700 mt-1" },
                            "\u2713 APPROVE GUDANG / SUDAH DIKELUARKAN ",
                            waktu(r.fulfilledAt))),
                    canRelease && r.status !== 'fulfilled' ? React.createElement("div", { className: "flex flex-wrap gap-2" },
                        React.createElement(Btn, { tone: "accent", onClick: () => release(r) }, "\uD83D\uDCE6 APPROVE & KELUARKAN STOK"),
                        React.createElement(Btn, { tone: "danger", onClick: () => reject(r) }, "\u2715 TOLAK")) : r.status === 'fulfilled' ? React.createElement(Pill, { tone: "done" }, "\u2713 APPROVE GUDANG / SELESAI") : React.createElement(Pill, { tone: "approved" },
                        "MENUNGGU TANGGAL ",
                        r.requestedForDate ? new Date(r.requestedForDate + 'T00:00:00').toLocaleDateString('id-ID') : 'NANTI')))),
            !rows.length && React.createElement("div", { className: "text-center text-slate-400 py-6 border rounded-xl" }, "Tidak ada permintaan pada kelompok ini.")));
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-2" }, "UPPROVE / ACC STOCK"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" },
            "Alur baru: ",
            React.createElement("b", null, "MENUNGGU ACC ADMIN \u2192 SUDAH DI-ACC ADMIN / MENUNGGU GUDANG \u2192 APPROVE GUDANG / SELESAI"),
            "."),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" },
                React.createElement("div", { className: "p-4 rounded-2xl bg-cyan-50 border" },
                    React.createElement("small", null, "TOTAL STOK GUDANG"),
                    React.createElement("b", { className: "block text-2xl" }, stock),
                    React.createElement("span", { className: "text-xs" }, "kantong semua produk")),
                React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border" },
                    React.createElement("small", null, "JENIS PRODUK"),
                    React.createElement("b", { className: "block text-2xl" }, products.length),
                    React.createElement("span", { className: "text-xs" }, "produk aktif")))),
        React.createElement(Card, null,
            section('📅 PERMINTAAN HARI INI', dayRows, true),
            section('🗓️ PERMINTAAN BESOK / TANGGAL BERIKUTNYA', futureRows, false)));
}
function GudangReceive({ me }) {
    const rs = toList(useDbList('returnRequests')).filter(r => r.status === 'pending'), products = toList(useDbList('config/products')).filter(p => p.active !== false), stockByProduct = useDbList('warehouse/stockByProduct'), [toast, show] = useToast();
    const receive = async (r) => {
        const product = products.find(p => p.id === r.productId);
        if (r.productId && Number(r.qty || 0) < 1)
            return show('Jumlah pengembalian tidak valid.', 'err');
        const s = await db.ref('users/' + r.driverId).once('value'), u = s.val();
        try {
            if (r.productId)
                await db.ref('warehouse/stockByProduct/' + r.productId).transaction(v => Number(v || 0) + Number(r.qty || 0));
            await db.ref('warehouse/stock').transaction(v => Number(v || 0) + Number(r.qty || 0));
            if (u === null || u === void 0 ? void 0 : u.username)
                await db.ref('driverStock/' + u.username).transaction(v => Math.max(0, Number(v || 0) - Number(r.qty || 0)));
            if (r.productId)
                await db.ref('driverStockByProduct/' + r.driverId + '/' + r.productId).transaction(v => Math.max(0, Number(v || 0) - Number(r.qty || 0)));
            await db.ref('returnRequests/' + r.id).update({ status: 'approved', receivedBy: me.id, receivedByName: me.name, receivedAt: Date.now(), approvedAt: Date.now(), approvedBy: me.id, approvedByName: me.name });
            await db.ref('warehouse/history').push({ type: 'kembali', qty: Number(r.qty || 0), productId: r.productId || null, productName: r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'Es Kristal', driverId: r.driverId, driverName: r.driverName, returnRequestId: r.id, by: me.id, byName: me.name, timestamp: Date.now() });
            await notify({ title: 'Pengembalian APPROVE GUDANG', message: `${r.qty} kantong ${r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'produk'} dari ${r.driverName} sudah diterima dan disetujui gudang.`, toUser: r.driverId, fromUser: me.id, menu: 'return' });
            await notify({ title: 'Pengembalian stok disetujui gudang', message: `Pengembalian ${r.qty} kantong ${r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'produk'} dari ${r.driverName} sudah APPROVE / SELESAI.`, toRole: 'admin', fromUser: me.id, menu: 'overview' });
            await createAudit('stock_return_received', `${r.qty} kantong ${r.productName || (product === null || product === void 0 ? void 0 : product.name) || 'produk'} dari ${r.driverName}`, me);
            show('Pengembalian APPROVE dan status menjadi SELESAI.');
        }
        catch (e) {
            show('Gagal menerima pengembalian: ' + e.message, 'err');
        }
    };
    const reject = async (r) => {
        const reason = prompt('Masukkan alasan penolakan pengembalian stok:');
        if (reason === null)
            return;
        const clean = String(reason).trim();
        if (!clean)
            return show('Alasan penolakan wajib diisi.', 'err');
        try {
            await db.ref('returnRequests/' + r.id).update({ status: 'rejected', rejectReason: clean, rejectedBy: me.id, rejectedByName: me.name, rejectedAt: Date.now() });
            await notify({ title: 'Pengembalian stok ditolak Gudang', message: `Pengembalian ${r.qty} kantong ${r.productName || 'produk'} dari ${r.driverName} ditolak. Alasan: ${clean}`, toUser: r.driverId, fromUser: me.id, data: { returnId: r.id, rejectReason: clean }, menu: 'return' });
            await notify({ title: 'Pengembalian stok ditolak Gudang', message: `Pengembalian ${r.qty} kantong ${r.productName || 'produk'} dari ${r.driverName} ditolak. Alasan: ${clean}`, toRole: 'admin', fromUser: me.id, data: { returnId: r.id, rejectReason: clean }, menu: 'overview' });
            await createAudit('stock_return_rejected', `${r.qty} kantong ${r.productName || 'produk'} dari ${r.driverName} ditolak: ${clean}`, me);
            show('Pengembalian ditolak dan alasannya sudah dicatat.');
        }
        catch (e) {
            show('Gagal menolak pengembalian: ' + e.message, 'err');
        }
    };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Terima Kembalian"),
        React.createElement(Card, null,
            React.createElement("div", { className: "space-y-2" },
                rs.map(r => React.createElement("div", { key: r.id, className: "flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 p-4 border rounded-xl bg-amber-50" },
                    React.createElement("div", null,
                        React.createElement("b", null, r.driverName),
                        React.createElement("div", { className: "text-sm font-semibold" },
                            r.productName || 'Es Kristal',
                            " \u00B7 ",
                            r.qty,
                            " kantong"),
                        React.createElement("div", { className: "text-xs" }, waktu(r.requestedAt)),
                        React.createElement("div", { className: "text-xs text-amber-700 mt-1" }, "MENUNGGU ACC GUDANG")),
                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                        React.createElement(Btn, { tone: "accent", onClick: () => receive(r) }, "\u2713 APPROVE / TERIMA"),
                        React.createElement(Btn, { tone: "danger", onClick: () => reject(r) }, "\u2715 TOLAK")))),
                !rs.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Tidak ada pengembalian yang menunggu ACC gudang."))));
}
