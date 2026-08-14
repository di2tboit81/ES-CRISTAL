function DriverHistoryFilter({ period, setPeriod, date, setDate }) { return React.createElement("div", { className: "flex flex-wrap items-end gap-2 mb-4" },
    React.createElement(Field, { label: "Periode Riwayat" },
        React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
            React.createElement("option", { value: "all" }, "SEMUA"),
            React.createElement("option", { value: "day" }, "PERTANGGAL"),
            React.createElement("option", { value: "month" }, "PERBULAN"),
            React.createElement("option", { value: "year" }, "PERTAHUN"))),
    period !== 'all' && React.createElement(Field, { label: "Tanggal Acuan" },
        React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) }))); }
function driverPeriodMatch(value, period, date) { if (period === 'all')
    return true; const t = Number(value || 0); if (!t)
    return false; const d = new Date(t), base = new Date((date || tanggalLokal()) + 'T00:00:00'); if (period === 'day')
    return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth() && d.getDate() === base.getDate(); if (period === 'month')
    return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth(); return d.getFullYear() === base.getFullYear(); }
function DriverHome({ me }) {
    const stockByProduct = useDbList('driverStockByProduct/' + me.id), legacyStock = useDbValue('driverStock/' + me.username, 0), oldPrice = useDbValue('config/pricePerBag', 15000), products = toList(useDbList('config/products')).filter(p => p.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')), invoiceCustomers = toList(useDbList('invoiceCustomers')).filter(b => b.approvalStatus === 'approved' && b.status !== 'rejected').sort((a, b) => (a.customerName || '').localeCompare(b.customerName || '')), ds = toList(useDbList('deliveries')).filter(d => d.driverId === me.id).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)), myStockRequests = toList(useDbList('stockRequests')).filter(r => r.driverId === me.id), [productId, setProductId] = useState(''), [customer, setCustomer] = useState(''), [invoiceId, setInvoiceId] = useState(''), [location, setLocation] = useState(''), [qty, setQty] = useState(''), [pay, setPay] = useState('cash'), [saving, setSaving] = useState(false), [period, setPeriod] = useState('all'), [periodDate, setPeriodDate] = useState(tanggalLokal()), [toast, show] = useToast();
    // ===== 4 Diagram Beranda Driver =====
    // Semua nilai dihitung langsung dari data Firebase realtime (stockByProduct,
    // stockRequests, deliveries) sehingga otomatis ikut berubah setiap ada
    // penambahan stok (ACC Gudang) maupun pengurangan stok (terjual/dikembalikan).
    const stockByProductVals = Object.values(stockByProduct || {}).map(v => Number(v || 0));
    // 1) Jumlah stok yang sedang diminta driver dan masih menunggu (belum dikeluarkan Gudang).
    const requestedQty = myStockRequests.filter(r => r.status === 'pending' || r.status === 'admin_approved').reduce((a, r) => a + Number(r.qtyRequested || 0), 0);
    // 2) Total stok yang sedang dibawa driver, gabungan semua jenis produk.
    const totalStockAllProducts = stockByProductVals.length ? stockByProductVals.reduce((a, b) => a + b, 0) : Number(legacyStock || 0);
    // 3) Rincian stok per jenis produk (dipakai untuk diagram batang per produk).
    const maxProductStock = stockByProductVals.length ? Math.max(...stockByProductVals, 1) : 1;
    // 4) Total kantong yang sudah terjual — ikut filter periode (SEMUA/PERTANGGAL/PERBULAN/PERTAHUN)
    //    yang sama dengan yang dipakai di daftar Transaksi Terbaru di bawah.
    const filteredDs = ds.filter(d => driverPeriodMatch(d.timestamp, period, periodDate));
    const soldQty = filteredDs.reduce((a, d) => a + Number(d.qty || 0), 0);
    // Ref dipakai sebagai sumber nilai terakhir input lokasi.
    // Ini mencegah validasi membaca state lama saat tombol Simpan ditekan.
    const locationRef = React.useRef('');
    const customerRef = React.useRef('');
    const customerInputRef = React.useRef(null);
    const locationInputRef = React.useRef(null);
    const setLocationSafe = (value) => {
        locationRef.current = value;
        setLocation(value);
    };
    const setCustomerSafe = (value) => {
        customerRef.current = value;
        setCustomer(value);
    };
    const selectedProduct = products.find(p => p.id === productId);
    const selectedInvoice = invoiceCustomers.find(b => b.id === invoiceId);
    const invoiceCustomerPrice = selectedProduct && selectedInvoice && selectedProduct.customerPrices
        ? selectedProduct.customerPrices[selectedInvoice.id]
        : undefined;
    const price = pay === 'invoice' && invoiceCustomerPrice !== undefined
        ? (+invoiceCustomerPrice || 0)
        : (selectedProduct ? (+selectedProduct.standardPrice || 0) : oldPrice);
    const resetForm = () => {
        setCustomer('');
        customerRef.current = '';
        setInvoiceId('');
        setLocation('');
        locationRef.current = '';
        if (locationInputRef.current)
            locationInputRef.current.value = '';
        if (customerInputRef.current)
            customerInputRef.current.value = '';
        setQty('');
        setProductId('');
        setPay('cash');
    };
    const save = async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (saving)
            return;
        // Ambil nilai langsung dari ref + state. Ref menjadi sumber utama
        // sehingga lokasi yang baru saja diketik tidak dianggap kosong.
        // Ambil nilai TERAKHIR langsung dari elemen input.
        // Tidak memakai substring/slice dan tidak pernah mengambil hanya kata pertama.
        const latestCustomer = pay === 'invoice'
            ? String((selectedInvoice === null || selectedInvoice === void 0 ? void 0 : selectedInvoice.customerName) || '')
            : String((_d = (_c = (_b = (_a = customerInputRef.current) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : customerRef.current) !== null && _c !== void 0 ? _c : customer) !== null && _d !== void 0 ? _d : '');
        const latestLocation = String((_h = (_g = (_f = (_e = locationInputRef.current) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : locationRef.current) !== null && _g !== void 0 ? _g : location) !== null && _h !== void 0 ? _h : '');
        // Hanya trim spasi di ujung. Isi di tengah dipertahankan utuh.
        const cleanCustomer = driverFullText(latestCustomer);
        const cleanLocation = driverFullText(latestLocation);
        const q = Number(qty);
        if (products.length && !selectedProduct)
            return show('Jenis produk wajib dipilih.', 'err');
        if (!Number.isInteger(q) || q < 1)
            return show('Jumlah kantong wajib diisi minimal 1 kantong.', 'err');
        const productStock = selectedProduct ? Number(stockByProduct[selectedProduct.id] || 0) : Number(legacyStock || 0);
        if (q > productStock)
            return show(`Stok ${(selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.name) || 'produk'} tidak cukup. Stok Anda saat ini ${Math.floor(productStock)} kantong.`, 'err');
        // Lokasi pelanggan bersifat OPSIONAL.
        // Jika dikosongkan, transaksi tetap boleh disimpan dan masuk laporan.
        let customerName = cleanCustomer;
        let invoiceCustomerId = null;
        let invoiceNo = null;
        let invoicePaymentStatus = null;
        if (pay === 'invoice') {
            if (!selectedInvoice)
                return show('Pilih pelanggan invoice terlebih dahulu.', 'err');
            if (!selectedProduct)
                return show('Pilih jenis produk terlebih dahulu.', 'err');
            if (invoiceCustomerPrice === undefined)
                return show('Harga penawaran untuk pelanggan invoice ini belum diatur.', 'err');
            if ((+invoiceCustomerPrice || 0) <= 0)
                return show('Harga invoice pelanggan belum tersedia.', 'err');
            customerName = String(selectedInvoice.customerName || '').trim();
            invoiceCustomerId = selectedInvoice.id;
            invoiceNo = selectedInvoice.invoiceNo || null;
            invoicePaymentStatus = 'unpaid';
            if (!customerName)
                return show('Nama pelanggan invoice tidak valid.', 'err');
        }
        else {
            if (!customerName)
                return show('Nama pelanggan / toko wajib diisi.', 'err');
        }
        if (price <= 0)
            return show('Harga produk belum tersedia.', 'err');
        const paymentStatus = pay === 'cash' ? 'paid' : 'unpaid';
        const now = Date.now();
        const deliveryRef = db.ref('deliveries').push();
        const deliveryId = deliveryRef.key;
        setSaving(true);
        let stockTaken = false;
        let stockRef = selectedProduct ? db.ref('driverStockByProduct/' + me.id + '/' + selectedProduct.id) : db.ref('driverStock/' + me.username);
        try {
            // Kurangi stok secara aman. Transaction mencegah dua penyimpanan
            // bersamaan membuat stok driver menjadi minus.
            const stockResult = await stockRef.transaction(current => {
                const currentStock = Number(current || 0);
                if (currentStock < q)
                    return;
                return currentStock - q;
            });
            if (!stockResult.committed) {
                throw new Error('Stok driver berubah atau tidak mencukupi. Silakan periksa stok lalu coba lagi.');
            }
            stockTaken = true;
            const deliveryData = {
                driverId: me.id,
                driverName: me.name,
                // Simpan teks lengkap persis sebagai satu nilai string.
                customerName: cleanCustomer,
                customerNameFull: cleanCustomer,
                location: cleanLocation,
                locationFull: cleanLocation,
                qty: q,
                productId: (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id) || null,
                productName: (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.name) || 'Es Kristal',
                pricePerUnit: price,
                total: q * price,
                paymentMethod: pay,
                paymentStatus,
                timestamp: now,
                createdAt: now,
                ...(pay === 'invoice'
                    ? {
                        invoiceCustomerId,
                        invoiceNo,
                        invoiceCustomerName: cleanCustomer || customerName,
                        invoiceStatusAtDelivery: invoicePaymentStatus
                    }
                    : {}),
                ...(pay === 'wait_cash'
                    ? { waitCashStatus: 'pending' }
                    : {})
            };
            // Simpan transaksi pengantaran terlebih dahulu.
            await deliveryRef.set(deliveryData);
            // Untuk invoice, jumlah dan total invoice pelanggan ikut bertambah.
            if (pay === 'invoice') {
                const ref = db.ref('invoiceCustomers/' + invoiceCustomerId);
                const snap = await ref.once('value');
                const bill = snap.val();
                if (!bill) {
                    await deliveryRef.remove();
                    throw new Error('Data pelanggan invoice tidak ditemukan.');
                }
                const nextQty = (+bill.qty || 0) + q;
                const nextTotal = (+bill.total || 0) + (q * price);
                const nextStatus = bill.status === 'paid' ? 'unpaid' : (bill.status || 'unpaid');
                const resetAssignment = bill.status === 'paid'
                    ? {
                        collectorId: null,
                        collectorName: null,
                        assignedAt: null,
                        assignedBy: null,
                        assignedByName: null
                    }
                    : {};
                await ref.update({
                    qty: nextQty,
                    total: nextTotal,
                    pricePerUnit: price,
                    status: nextStatus,
                    lastDeliveryAt: now,
                    lastDeliveryBy: me.id,
                    lastDeliveryByName: me.name,
                    lastDeliveryQty: q,
                    lastDeliveryTotal: q * price,
                    lastDeliveryLocation: cleanLocation,
                    lastDeliveryId: deliveryId,
                    ...resetAssignment
                });
            }
            const label = pay === 'wait_cash' ? 'WAIT CASH' : pay === 'invoice' ? 'INVOICE' : 'CASH';
            await notify({
                title: 'Pengantaran berhasil disimpan',
                message: `${me.name} mencatat ${label} ${(selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.name) || 'Es Kristal'} ${q} kantong untuk ${customerName}. Nilai ${rupiah(q * price)}. Lokasi: ${cleanLocation}.`,
                toRole: 'admin',
                fromUser: me.id,
                data: { deliveryId },
                menu: 'deliveries'
            });
            await notify({
                title: 'Pengantaran driver masuk laporan',
                message: `Pengantaran ${customerName} ${q} kantong (${label}) sudah tersimpan dan masuk laporan driver/admin.`,
                toRole: 'superadmin',
                fromUser: me.id,
                data: { deliveryId },
                menu: 'deliveries'
            });
            await createAudit('delivery', `${customerName} ${(selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.name) || 'Es Kristal'} ${q} kantong ${label}${invoiceNo ? ' · ' + invoiceNo : ''} · ${cleanLocation}`, me);
            resetForm();
            show(pay === 'wait_cash'
                ? 'Pengantaran WAIT CASH berhasil disimpan dan masuk laporan.'
                : pay === 'invoice'
                    ? 'Pengantaran INVOICE berhasil disimpan dan masuk laporan invoice.'
                    : 'Pengantaran CASH berhasil disimpan dan masuk laporan.');
        }
        catch (e) {
            console.error('Gagal menyimpan pengantaran:', e);
            // Jika stok sudah terpotong tetapi transaksi gagal, kembalikan stok.
            try {
                if (typeof stockTaken !== 'undefined' && stockTaken) {
                    await stockRef.transaction(v => (Number(v || 0) + q));
                }
            }
            catch (rollbackError) {
                console.error('Rollback stok gagal:', rollbackError);
            }
            show('Pengantaran gagal disimpan: ' + ((e === null || e === void 0 ? void 0 : e.message) || 'Terjadi kesalahan. Data tidak disimpan.'), 'err');
        }
        finally {
            setSaving(false);
        }
    };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" },
            "Halo, ",
            me.name,
            " \uD83D\uDC4B"),
        React.createElement(DriverHistoryFilter, { period: period, setPeriod: setPeriod, date: periodDate, setDate: setPeriodDate }),
        React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5" },
            React.createElement(Card, null,
                React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "STOK DIMINTA"),
                React.createElement(IceGauge, { label: "Menunggu diproses Admin/Gudang", value: requestedQty, max: Math.max(requestedQty, 50) })),
            React.createElement(Card, null,
                React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "TOTAL STOK DIBAWA"),
                React.createElement(IceGauge, { label: "Semua jenis produk", value: totalStockAllProducts, max: Math.max(totalStockAllProducts, 50) })),
            React.createElement(Card, null,
                React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "STOK PER JENIS PRODUK"),
                React.createElement("div", { className: "space-y-3" },
                    products.map(p => {
                        const val = Number(stockByProduct[p.id] || 0), pct = Math.max(0, Math.min(100, (val / maxProductStock) * 100));
                        return React.createElement("div", { key: p.id },
                            React.createElement("div", { className: "flex justify-between text-xs mb-1" },
                                React.createElement("span", { className: "text-slate-600" }, p.name),
                                React.createElement("b", null,
                                    val.toLocaleString('id-ID'),
                                    " kantong")),
                            React.createElement("div", { className: "h-2 rounded-full bg-slate-100 overflow-hidden" },
                                React.createElement("div", { className: "h-full bg-frost-400", style: { width: pct + '%' } })));
                    }),
                    !products.length && React.createElement("div", { className: "text-xs text-slate-400" }, "Belum ada jenis produk."))),
            React.createElement(Card, null,
                React.createElement("div", { className: "text-xs font-mono text-slate-400 mb-3" }, "STOK TERJUAL"),
                React.createElement(IceGauge, { label: period === 'all' ? 'Total kantong terjual (semua)' : period === 'day' ? 'Terjual pada tanggal terpilih' : period === 'month' ? 'Terjual pada bulan terpilih' : 'Terjual pada tahun terpilih', value: soldQty, max: Math.max(soldQty, 50) }))),
        React.createElement("div", { className: "mb-5" },
            React.createElement(Card, null,
                React.createElement("div", { className: "text-xs text-slate-400" }, "HARGA PRODUK SAAT INI"),
                React.createElement("div", { className: "text-3xl font-display font-bold" }, rupiah(price)),
                React.createElement("div", { className: "text-sm text-slate-500" },
                    (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.name) || 'Pilih produk',
                    " \u00B7 per kantong"))),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("b", null, "Input Pengantaran"),
            React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4" },
                React.createElement(Field, { label: "Jenis Produk" },
                    React.createElement("select", { className: inputCls, value: productId, disabled: saving, onChange: e => {
                            setProductId(e.target.value);
                            setInvoiceId('');
                        } },
                        React.createElement("option", { value: "" }, products.length ? 'Pilih produk' : 'Es Kristal (harga lama)'),
                        products.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name)))),
                React.createElement(Field, { label: "Jenis Pembayaran" },
                    React.createElement("select", { className: inputCls, value: pay, disabled: saving, onChange: e => {
                            const v = e.target.value;
                            setPay(v);
                            setCustomer('');
                            customerRef.current = '';
                            if (customerInputRef.current)
                                customerInputRef.current.value = '';
                            setInvoiceId('');
                        } },
                        React.createElement("option", { value: "cash" }, "CASH"),
                        React.createElement("option", { value: "wait_cash" }, "WAIT CASH"),
                        React.createElement("option", { value: "invoice" }, "INVOICE"))),
                pay === 'invoice'
                    ? React.createElement(Field, { label: "Pelanggan Invoice" },
                        React.createElement("select", { className: inputCls, value: invoiceId, disabled: saving, onChange: e => setInvoiceId(e.target.value) },
                            React.createElement("option", { value: "" }, "Pilih pelanggan invoice"),
                            invoiceCustomers.map(b => React.createElement("option", { key: b.id, value: b.id }, b.customerName))))
                    : React.createElement(Field, { label: "Pelanggan / Toko" },
                        React.createElement("input", { id: "driver-customer-name", name: "customerName", ref: customerInputRef, className: inputCls + ' driver-full-input', defaultValue: customer, disabled: saving, onChange: e => setCustomerSafe(e.target.value), placeholder: "Contoh: TOKO A" })),
                React.createElement(Field, { label: "Lokasi Pelanggan" },
                    React.createElement("input", { id: "driver-customer-location", name: "customerLocation", ref: locationInputRef, autoComplete: "street-address", className: inputCls + ' driver-full-input', defaultValue: location, disabled: saving, onChange: e => setLocationSafe(e.target.value), placeholder: "Alamat / lokasi pelanggan" })),
                React.createElement(Field, { label: "Jumlah Kantong" },
                    React.createElement("input", { type: "number", min: "1", step: "1", inputMode: "numeric", className: inputCls, value: qty, disabled: saving, onChange: e => setQty(e.target.value.replace(/[^\d]/g, '')), placeholder: "Contoh: 2" })),
                React.createElement("div", { className: "mb-3" },
                    React.createElement("span", { className: "text-xs text-slate-500" }, "Total"),
                    React.createElement("div", { className: "font-mono font-bold" }, rupiah((+qty || 0) * price)),
                    pay === 'invoice' && selectedInvoice &&
                        React.createElement("div", { className: "text-xs text-slate-500 mt-1" },
                            "Pelanggan: ",
                            selectedInvoice.customerName,
                            selectedInvoice.invoiceNo && React.createElement(React.Fragment, null,
                                " \u00B7 ",
                                selectedInvoice.invoiceNo)))),
            React.createElement("div", { className: "flex flex-wrap items-center gap-3 mt-2" },
                React.createElement(Btn, { tone: "accent", onClick: save, disabled: saving }, saving ? '⏳ Menyimpan...' : '💾 Simpan Pengantaran'),
                React.createElement("div", { className: "text-xs text-slate-500" }, "Lokasi pelanggan opsional. Isi jika diperlukan. Setelah berhasil disimpan, transaksi otomatis masuk ke laporan."))),
        React.createElement(Card, null,
            React.createElement("div", { className: "flex flex-wrap justify-between items-start gap-3" },
                React.createElement("div", null,
                    React.createElement("b", null, "Transaksi Terbaru"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Mengikuti filter periode di atas."))),
            React.createElement("div", { className: "overflow-x-auto mt-4" },
                React.createElement("table", { className: "w-full text-sm" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "text-left text-slate-400 text-xs border-b" },
                            React.createElement("th", { className: "py-2" }, "Waktu"),
                            React.createElement("th", null, "Produk"),
                            React.createElement("th", null, "Pelanggan"),
                            React.createElement("th", null, "Lokasi"),
                            React.createElement("th", null, "Qty"),
                            React.createElement("th", null, "Total"),
                            React.createElement("th", null, "Pembayaran"),
                            React.createElement("th", null, "Status"))),
                    React.createElement("tbody", null,
                        filteredDs.slice(0, 20).map(d => React.createElement("tr", { key: d.id, className: "border-b border-slate-100" },
                            React.createElement("td", { className: "py-2 text-xs" }, waktu(d.timestamp)),
                            React.createElement("td", null, d.productName || 'Es Kristal'),
                            React.createElement("td", { className: "whitespace-normal break-words whitespace-pre-wrap min-w-[220px]", title: String(d.customerNameFull || d.customerName || '') }, String(d.customerNameFull || d.customerName || '')),
                            React.createElement("td", { className: "whitespace-normal break-words whitespace-pre-wrap min-w-[220px]", title: String(d.locationFull || d.location || '') }, String(d.locationFull || d.location || '-')),
                            React.createElement("td", null, d.qty),
                            React.createElement("td", null, rupiah(d.total)),
                            React.createElement("td", null, d.paymentMethod === 'invoice' ? 'INVOICE' : d.paymentMethod === 'wait_cash' ? 'WAIT CASH' : 'CASH'),
                            React.createElement("td", null, d.paymentMethod === 'cash' ? 'LUNAS' : d.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'))),
                        !filteredDs.length &&
                            React.createElement("tr", null,
                                React.createElement("td", { colSpan: "8", className: "py-6 text-center text-slate-400" }, "Belum ada transaksi.")))))));
}
function WaitCashDriver({ me }) {
    const ds = toList(useDbList('deliveries')).filter(d => d.driverId === me.id && d.paymentMethod === 'wait_cash').sort((a, b) => b.timestamp - a.timestamp), [period, setPeriod] = useState('all'), [periodDate, setPeriodDate] = useState(tanggalLokal()), [toast, show] = useToast();
    const filteredDs = ds.filter(d => driverPeriodMatch(d.timestamp, period, periodDate));
    const lunas = async (d) => {
        if (d.paymentStatus === 'paid')
            return;
        const now = Date.now();
        await db.ref('deliveries/' + d.id).update({ paymentStatus: 'paid', waitCashStatus: 'paid', paidAt: now, paidBy: me.id, paidByName: me.name });
        await notify({ title: 'WAIT CASH LUNAS', message: `${d.customerName} sudah membayar ${rupiah(d.total)} kepada ${me.name}.`, toRole: 'admin', fromUser: me.id, data: { deliveryId: d.id }, menu: 'deliveries' });
        await notify({ title: 'WAIT CASH LUNAS', message: `${d.customerName} sudah membayar ${rupiah(d.total)}.`, toRole: 'superadmin', fromUser: me.id, data: { deliveryId: d.id }, menu: 'deliveries' });
        await createAudit('wait_cash_paid', `${d.customerName} ${rupiah(d.total)} dilunasi oleh ${me.name}`, me);
        show('WAIT CASH berhasil ditandai LUNAS di semua laporan.');
    };
    const pending = filteredDs.filter(d => d.paymentStatus !== 'paid'), pendingTotal = pending.reduce((a, d) => a + (+d.total || 0), 0);
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "\uD83D\uDCB5 WAIT CASH"),
        React.createElement(DriverHistoryFilter, { period: period, setPeriod: setPeriod, date: periodDate, setDate: setPeriodDate }),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" },
                React.createElement("div", { className: "p-4 rounded-2xl bg-amber-50 border" },
                    React.createElement("small", null, "MENUNGGU PEMBAYARAN"),
                    React.createElement("b", { className: "block text-2xl text-amber-700" }, pending.length),
                    React.createElement("span", { className: "text-xs" }, rupiah(pendingTotal))),
                React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                    React.createElement("small", null, "SUDAH LUNAS"),
                    React.createElement("b", { className: "block text-2xl text-emerald-700" }, filteredDs.filter(d => d.paymentStatus === 'paid').length)),
                React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border" },
                    React.createElement("small", null, "TOTAL TRANSAKSI"),
                    React.createElement("b", { className: "block text-2xl text-sky-700" }, filteredDs.length)))),
        React.createElement("div", { className: "space-y-3" },
            filteredDs.map(d => React.createElement(Card, { key: d.id, className: d.paymentStatus === 'paid' ? 'border-l-4 border-emerald-400' : 'border-l-4 border-amber-400' },
                React.createElement("div", { className: "flex flex-wrap justify-between gap-4" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "text-xs text-slate-400" }, waktu(d.timestamp)),
                        React.createElement("b", { className: "text-xl whitespace-pre-wrap break-words" }, d.customerNameFull || d.customerName),
                        React.createElement("div", { className: "text-sm mt-1 whitespace-pre-wrap break-words" },
                            "\uD83D\uDCCD ",
                            d.locationFull || d.location || 'Lokasi belum diisi'),
                        React.createElement("div", { className: "text-sm mt-1" },
                            d.qty,
                            " kantong \u00B7 ",
                            React.createElement("b", null, rupiah(d.total)))),
                    React.createElement("div", { className: "text-right" }, d.paymentStatus === 'paid' ? React.createElement(Pill, { tone: "done" }, "\u2713 LUNAS") : React.createElement(React.Fragment, null,
                        React.createElement(Pill, { tone: "pending" }, "WAIT CASH"),
                        React.createElement("br", null),
                        React.createElement(Btn, { tone: "accent", className: "mt-3", onClick: () => lunas(d) }, "\u2713 LUNAS")))),
                d.paymentStatus === 'paid' && React.createElement("div", { className: "text-xs text-emerald-700 mt-3" },
                    "Dibayar ",
                    waktu(d.paidAt),
                    " oleh ",
                    d.paidByName || me.name))),
            !filteredDs.length && React.createElement(Card, null,
                React.createElement("div", { className: "text-center text-slate-400 py-8" }, "Belum ada pelanggan WAIT CASH pada periode ini."))));
}
