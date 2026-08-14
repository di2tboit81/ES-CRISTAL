function InvoicePrint({ bill, cfg }) { const print = () => { const w = window.open('', '_blank', 'width=900,height=1000'); if (!w)
    return; const logo = cfg.logo ? `<img src="${cfg.logo}" style="width:76px;height:76px;object-fit:contain;border-radius:14px">` : ''; w.document.write(`<!doctype html><html><head><title>${bill.invoiceNo || 'Invoice'}</title><meta charset="utf-8"><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;background:#eef9fc;margin:0;padding:30px;color:#102a43}.sheet{max-width:820px;margin:auto;background:#fff;padding:42px;border-radius:22px;box-shadow:0 15px 50px rgba(0,100,140,.16)}.top{display:flex;justify-content:space-between;gap:25px;border-bottom:4px solid #1c4a73;padding-bottom:22px}.brand{display:flex;gap:18px;align-items:center}.brand h1{margin:0;font-size:26px}.muted{color:#64748b;font-size:13px;line-height:1.6}.inv{text-align:right}.inv h2{margin:0 0 8px;font-size:25px;color:#075572}.box{background:#f4fbfd;border:1px solid #d8edf3;border-radius:14px;padding:16px;margin-top:22px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.value{font-weight:700;margin-top:4px}.items{width:100%;border-collapse:collapse;margin-top:25px}.items th{background:#07334b;color:#fff;text-align:left;padding:12px}.items td{padding:13px;border-bottom:1px solid #e2e8f0}.right{text-align:right}.total{margin-left:auto;width:330px;margin-top:18px}.total div{display:flex;justify-content:space-between;padding:8px 0}.grand{font-size:20px;font-weight:800;border-top:2px solid #1c4a73;margin-top:5px;padding-top:12px}.status{display:inline-block;padding:7px 12px;border-radius:999px;background:#fff4d6;color:#9a6700;font-weight:700;font-size:12px}.foot{margin-top:45px;display:grid;grid-template-columns:1fr 1fr;gap:80px;text-align:center}.line{border-bottom:1px solid #334155;margin:55px 20px 8px}.small{font-size:11px;color:#94a3b8;text-align:center;margin-top:35px}@media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:none;padding:25px}.no-print{display:none}}@media(max-width:650px){.top,.grid{display:block}.inv{text-align:left;margin-top:20px}.total{width:100%}.foot{gap:25px}}</style></head><body><div class="sheet"><div class="top"><div class="brand">${logo}<div><h1>${cfg.name || 'GlasirEs'}</h1><div class="muted">${cfg.address || ''}<br>${cfg.phone || ''}</div></div></div><div class="inv"><h2>INVOICE</h2><b>${bill.invoiceNo || '-'}</b><div class="muted">Tanggal: ${new Date(bill.createdAt || Date.now()).toLocaleDateString('id-ID')}<br>Jatuh Tempo: ${bill.dueDate ? new Date(bill.dueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'}</div></div></div><div class="box grid"><div><div class="label">Ditagihkan kepada</div><div class="value">${bill.customerName || '-'}</div><div class="muted">${bill.customerPhone || ''}<br>${bill.customerAddress || ''}</div></div><div><div class="label">Penagih</div><div class="value">${bill.collectorName || 'Belum ditugaskan'}</div><div class="muted">Metode: INVOICE<br>Status: <span class="status">${bill.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}</span></div></div></div><table class="items"><thead><tr><th>Deskripsi</th><th>Qty</th><th>Harga</th><th class="right">Jumlah</th></tr></thead><tbody><tr><td>Es Kristal</td><td>${bill.qty || 0} kantong</td><td>${rupiah(bill.pricePerUnit || 0)}</td><td class="right">${rupiah(bill.total || 0)}</td></tr></tbody></table><div class="total"><div><span>Subtotal</span><b>${rupiah(bill.total || 0)}</b></div><div class="grand"><span>TOTAL TAGIHAN</span><span>${rupiah(bill.total || 0)}</span></div></div><div class="box"><b>Catatan Penagihan</b><div class="muted" style="margin-top:6px">${bill.note || 'Mohon melakukan pembayaran sesuai jumlah dan tanggal jatuh tempo.'}</div></div><div class="foot"><div>Hormat kami,<div class="line"></div><b>${cfg.name || 'GlasirEs'}</b></div><div>Dibuat oleh,<div class="line"></div><b>${bill.createdByName || 'Admin'}</b></div></div><div class="small">Invoice resmi ${cfg.name || 'GlasirEs'} · Power by Syech B@-it · Copyright © 2026</div></div><div class="no-print" style="text-align:center;margin:18px"><button onclick="window.print()" style="padding:12px 20px;border:0;border-radius:12px;background:#07334b;color:#fff;font-weight:700">🖨 Cetak Invoice</button></div></body></html>`); w.document.close(); w.focus(); }; return React.createElement(Btn, { tone: "accent", onClick: print }, "\uD83D\uDDA8 Cetak Invoice"); }
function InvoiceDriver({ me }) {
    const price = useDbValue('config/pricePerBag', 15000), allBills = toList(useDbList('invoiceCustomers')).filter(x => x.createdBy === me.id || x.collectorId === me.id).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), [name, setName] = useState(''), [phone, setPhone] = useState(''), [address, setAddress] = useState(''), [due, setDue] = useState(''), [note, setNote] = useState(''), [toast, show] = useToast(), nameRef = React.useRef(null), phoneRef = React.useRef(null), addressRef = React.useRef(null), noteRef = React.useRef(null), [period, setPeriod] = useState('all'), [periodDate, setPeriodDate] = useState(tanggalLokal());
    const bills = allBills.filter(b => driverPeriodMatch(b.createdAt || b.submittedAt, period, periodDate));
    const submit = async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const fullName = driverFullText((_b = (_a = nameRef.current) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : name), fullPhone = driverFullText((_d = (_c = phoneRef.current) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : phone), fullAddress = driverFullText((_f = (_e = addressRef.current) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : address), fullNote = driverFullText((_h = (_g = noteRef.current) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : note);
        if (!fullName)
            return show('Nama pelanggan wajib diisi.', 'err');
        const r = db.ref('invoiceCustomers').push();
        await r.set({
            invoiceNo: null, customerName: fullName, customerNameFull: fullName, customerPhone: fullPhone, customerAddress: fullAddress,
            qty: 0, pricePerUnit: +price || 0, total: 0, dueDate: due, note: fullNote,
            status: 'pendingApproval', approvalStatus: 'pending', createdBy: me.id, createdByName: me.name, createdAt: Date.now()
        });
        await notify({ title: 'Persetujuan pelanggan invoice', message: `${me.name} mengajukan ${fullName} sebagai pelanggan invoice. Menunggu ACC admin.`, toRole: 'admin', fromUser: me.id, data: { invoiceId: r.key }, menu: 'invoiceCustomers' });
        await notify({ title: 'Persetujuan pelanggan invoice', message: `${me.name} mengajukan ${fullName}. Menunggu ACC admin.`, toRole: 'superadmin', fromUser: me.id, data: { invoiceId: r.key }, menu: 'invoiceCustomers' });
        await createAudit('invoice_customer_submit', `${fullName} · menunggu ACC admin`, me);
        setName('');
        setPhone('');
        setAddress('');
        setDue('');
        setNote('');
        if (nameRef.current)
            nameRef.current.value = '';
        if (phoneRef.current)
            phoneRef.current.value = '';
        if (addressRef.current)
            addressRef.current.value = '';
        if (noteRef.current)
            noteRef.current.value = '';
        show('Data pelanggan invoice berhasil dikirim ke admin.');
    };
    const statusText = b => b.status === 'paid' ? 'LUNAS' : b.approvalStatus === 'pending' || b.status === 'pendingApproval' ? 'MENUNGGU ACC ADMIN' : b.status === 'assigned' ? 'DITUGASKAN' : 'BELUM LUNAS';
    const statusTone = b => b.status === 'paid' ? 'done' : (b.approvalStatus === 'pending' || b.status === 'pendingApproval') ? 'pending' : b.status === 'assigned' ? 'approved' : 'default';
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Pelanggan & Penagihan Invoice"),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("b", { className: "block mb-4" }, "Ajukan Pelanggan Pembayaran Invoice"),
            React.createElement("div", { className: "grid md:grid-cols-2 gap-3" },
                React.createElement(Field, { label: "Nama Pelanggan / Toko" },
                    React.createElement("input", { ref: nameRef, className: inputCls + ' driver-full-input', defaultValue: name, onInput: e => setName(e.currentTarget.value), placeholder: "Contoh: Toko Makmur" })),
                React.createElement(Field, { label: "No. HP" },
                    React.createElement("input", { ref: phoneRef, className: inputCls + ' driver-full-input', defaultValue: phone, onInput: e => setPhone(e.currentTarget.value) })),
                React.createElement(Field, { label: "Alamat" },
                    React.createElement("input", { ref: addressRef, className: inputCls + ' driver-full-input', defaultValue: address, onInput: e => setAddress(e.currentTarget.value) })),
                React.createElement(Field, { label: "Jatuh Tempo" },
                    React.createElement("input", { type: "date", className: inputCls, value: due, onChange: e => setDue(e.target.value) })),
                React.createElement(Field, { label: "Catatan" },
                    React.createElement("input", { ref: noteRef, className: inputCls + ' driver-full-input', defaultValue: note, onInput: e => setNote(e.currentTarget.value), placeholder: "Catatan pelanggan / invoice" }))),
            React.createElement("div", { className: "flex justify-end mt-2" },
                React.createElement(Btn, { tone: "accent", onClick: submit }, "\uD83D\uDCE8 Kirim ke Admin untuk ACC"))),
        React.createElement(Card, null,
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "Data Invoice Saya"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Pengajuan baru wajib disetujui admin sebelum menjadi pelanggan invoice aktif.")),
                React.createElement(Pill, null,
                    bills.length,
                    " data")),
            React.createElement(DriverHistoryFilter, { period: period, setPeriod: setPeriod, date: periodDate, setDate: setPeriodDate }),
            React.createElement("div", { className: "space-y-3" },
                bills.map(b => React.createElement("div", { key: b.id, className: "p-4 border rounded-2xl bg-white/70" },
                    React.createElement("div", { className: "flex flex-wrap justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("b", { className: "whitespace-pre-wrap break-words" }, String(b.customerNameFull || b.customerName || '')),
                            React.createElement("div", { className: "text-xs text-slate-500" },
                                b.invoiceNo,
                                " \u00B7 ",
                                b.qty,
                                " kantong \u00B7 ",
                                rupiah(b.total)),
                            React.createElement("div", { className: "text-xs mt-1" },
                                "Jatuh tempo: ",
                                b.dueDate || '-',
                                " \u00B7 Penagih: ",
                                b.collectorName || 'Belum ditugaskan')),
                        React.createElement(Pill, { tone: statusTone(b) }, statusText(b))),
                    b.approvalStatus === 'rejected' && React.createElement("div", { className: "mt-2 p-2 rounded-lg bg-rose-50 text-rose-700 text-xs" }, "Pengajuan ditolak admin."))),
                !bills.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada data pelanggan invoice."))));
}
function InvoiceAdmin({ me }) {
    const bills = toList(useDbList('invoiceCustomers')).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), users = toList(useDbList('users')), drivers = users.filter(u => u.role === 'driver' && u.active !== false), cfg = useDbValue('config/company', {}), price = useDbValue('config/pricePerBag', 15000), paymentReports = toList(useDbList('invoicePaymentReports')).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), [name, setName] = useState(''), [phone, setPhone] = useState(''), [address, setAddress] = useState(''), [due, setDue] = useState(''), [note, setNote] = useState(''), [search, setSearch] = useState(''), [toast, show] = useToast();
    const create = async () => {
        if (!name.trim())
            return show('Nama pelanggan wajib diisi.', 'err');
        const r = db.ref('invoiceCustomers').push(), no = 'INV-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-7);
        await r.set({ invoiceNo: no, customerName: name.trim(), customerPhone: phone.trim(), customerAddress: address.trim(), qty: 0, pricePerUnit: +price || 0, total: 0, dueDate: due, note: note.trim(), status: 'unpaid', approvalStatus: 'approved', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now(), createdBy: me.id, createdByName: me.name, createdAt: Date.now() });
        await createAudit('invoice_customer_created', `${name.trim()} ${no} dibuat langsung oleh ${me.name}`, me);
        setName('');
        setPhone('');
        setAddress('');
        setDue('');
        setNote('');
        show('Pelanggan invoice langsung tersimpan.');
    };
    const approve = async (b) => {
        await db.ref('invoiceCustomers/' + b.id).update({ status: 'unpaid', approvalStatus: 'approved', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() });
        await notify({ title: 'Pelanggan invoice disetujui', message: `${b.customerName} (${b.invoiceNo}) telah disetujui admin dan masuk ke menu pelanggan aktif.`, toUser: b.createdBy, fromUser: me.id, data: { invoiceId: b.id }, menu: 'invoiceCustomers' });
        await notify({ title: 'Pelanggan invoice disetujui', message: `${b.customerName} (${b.invoiceNo}) telah disetujui admin.`, toRole: 'superadmin', fromUser: me.id, data: { invoiceId: b.id }, menu: 'invoiceCustomers' });
        await createAudit('invoice_customer_approved', `${b.invoiceNo} disetujui oleh ${me.name}`, me);
        show('Pengajuan invoice disetujui.');
    };
    const reject = async (b) => {
        if (!confirm(`Tolak pengajuan ${b.customerName} (${b.invoiceNo})?`))
            return;
        await db.ref('invoiceCustomers/' + b.id).update({ status: 'rejected', approvalStatus: 'rejected', rejectedBy: me.id, rejectedByName: me.name, rejectedAt: Date.now() });
        await notify({ title: 'Pengajuan invoice ditolak', message: `Pengajuan ${b.customerName} (${b.invoiceNo}) ditolak oleh admin.`, toUser: b.createdBy, fromUser: me.id, data: { invoiceId: b.id }, menu: 'invoiceCustomers' });
        await createAudit('invoice_customer_rejected', `${b.invoiceNo} ditolak oleh ${me.name}`, me);
        show('Pengajuan ditolak.', 'err');
    };
    const assign = async (b, driverId) => {
        if (!driverId)
            return;
        const d = drivers.find(x => x.id === driverId);
        if (!d)
            return;
        if (b.approvalStatus === 'pending' || b.status === 'pendingApproval')
            return show('ACC pengajuan terlebih dahulu.', 'err');
        if ((+b.total || 0) <= 0)
            return show('Belum ada pesanan invoice yang bisa ditagihkan.', 'err');
        const dueKey = String(b.dueDate || '').slice(0, 10), todayKey = tanggalLokal();
        if (dueKey && dueKey > todayKey)
            return show(`Belum jatuh tempo. Penagihan baru bisa ditugaskan setelah ${b.dueDate}.`, 'err');
        const assignedInvoiceNo = b.invoiceNo || ('INV-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-7));
        await db.ref('invoiceCustomers/' + b.id).update({ invoiceNo: assignedInvoiceNo, collectorId: d.id, collectorName: d.name, status: b.status === 'paid' ? 'paid' : 'assigned', assignedAt: Date.now(), assignedBy: me.id, assignedByName: me.name });
        await notify({ title: 'Tugas penagihan invoice', message: `Anda ditugaskan menagih ${b.customerName} (${b.invoiceNo}) sebesar ${rupiah(b.total)}.`, toUser: d.id, fromUser: me.id, data: { invoiceId: b.id }, menu: 'collection' });
        await createAudit('invoice_assign', `${b.invoiceNo} -> ${d.name}`, me);
        show(`Penagihan ditugaskan ke ${d.name}.`);
    };
    const markPaid = async (b) => {
        if (b.status === 'paid')
            return;
        await db.ref('invoiceCustomers/' + b.id).update({ status: 'paid', paidAt: Date.now(), paidBy: me.id, paidByName: me.name, paymentSource: 'admin', paymentNote: 'Dikonfirmasi langsung oleh Admin' });
        await createAudit('invoice_paid_admin', `${b.invoiceNo} dilunasi langsung oleh ${me.name}`, me);
        if (b.createdBy)
            await notify({ title: 'Invoice sudah lunas', message: `${b.customerName} (${b.invoiceNo}) telah dikonfirmasi lunas oleh admin.`, toUser: b.createdBy, fromUser: me.id, data: { invoiceId: b.id }, menu: 'invoiceCustomers' });
        show('Invoice ditandai LUNAS.');
    };
    const approvePayment = async (pr) => {
        const snap = await db.ref('invoiceCustomers/' + pr.invoiceId).once('value'), b = snap.val();
        if (!b)
            return show('Invoice tidak ditemukan.', 'err');
        await db.ref('invoiceCustomers/' + pr.invoiceId).update({ status: 'paid', paidAt: pr.paidAt || Date.now(), paidBy: pr.driverId, paidByName: pr.driverName, paymentSource: 'driver', paymentNote: pr.note || '', paymentApprovedBy: me.id, paymentApprovedByName: me.name, paymentApprovedAt: Date.now() });
        await db.ref('invoicePaymentReports/' + pr.id).update({ status: 'approved', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() });
        await notify({ title: 'Pembayaran invoice di-ACC', message: `Pembayaran ${b.customerName} (${b.invoiceNo}) sebesar ${rupiah(b.total)} telah di-ACC admin.`, toUser: pr.driverId, fromUser: me.id, data: { invoiceId: b.id }, menu: 'collection' });
        await createAudit('invoice_payment_approved', `${b.invoiceNo} pembayaran driver ${pr.driverName} di-ACC`, me);
        show('Pembayaran driver di-ACC dan invoice menjadi LUNAS.');
    };
    const rejectPayment = async (pr) => {
        await db.ref('invoicePaymentReports/' + pr.id).update({ status: 'rejected', approvedBy: me.id, approvedByName: me.name, approvedAt: Date.now() });
        await notify({ title: 'Laporan pembayaran invoice ditolak', message: `Laporan pembayaran ${pr.invoiceNo} ditolak admin.`, toUser: pr.driverId, fromUser: me.id, data: { invoiceId: pr.invoiceId }, menu: 'collection' });
        show('Laporan pembayaran ditolak.', 'err');
    };
    const remove = async (b) => { if (!confirm('Hapus data invoice ini?'))
        return; await db.ref('invoiceCustomers/' + b.id).remove(); show('Data invoice dihapus.'); };
    const activeBills = bills.filter(b => b.approvalStatus === 'approved' || b.status === 'unpaid' || b.status === 'assigned' || b.status === 'paid');
    const pendingBills = bills.filter(b => b.approvalStatus === 'pending' || b.status === 'pendingApproval' || b.status === 'pending');
    const filtered = activeBills.filter(b => (b.customerName || '').toLowerCase().includes(search.toLowerCase()) || (b.invoiceNo || '').toLowerCase().includes(search.toLowerCase()));
    const unpaidCount = activeBills.filter(b => b.status !== 'paid').length, paidCount = activeBills.filter(b => b.status === 'paid').length;
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Pelanggan & Penagihan Invoice"),
        (() => { const approved = bills.filter(b => b.approvalStatus === 'approved' && b.status !== 'rejected'), unpaid = approved.filter(b => b.status !== 'paid'), paid = approved.filter(b => b.status === 'paid'), totalAll = approved.reduce((a, b) => a + (+b.total || 0), 0), unpaidTotal = unpaid.reduce((a, b) => a + (+b.total || 0), 0), paidTotal = paid.reduce((a, b) => a + (+b.total || 0), 0), dueNow = unpaid.filter(b => !b.dueDate || String(b.dueDate).slice(0, 10) <= tanggalLokal()), notYet = unpaid.filter(b => b.dueDate && String(b.dueDate).slice(0, 10) > tanggalLokal()), printUnpaid = () => { const w = window.open('', '_blank', 'width=1100,height=900'); if (!w)
            return; const rows = unpaid.map((b, i) => `<tr><td>${i + 1}</td><td>${b.customerName || '-'}</td><td>${b.customerPhone || '-'}</td><td>${b.dueDate || '-'}</td><td>${rupiah(b.total)}</td><td>${b.collectorName || 'Belum ditugaskan'}</td><td>${b.collectorId ? 'TUGAS INVOICE BELUM LUNAS' : 'BELUM DITAGIH'}</td></tr>`).join(''); w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Laporan Invoice Pelanggan Belum Lunas</title><style>body{font-family:Arial;padding:28px;color:#172033}h1{margin-bottom:4px}.muted{color:#64748b}.cards{display:flex;gap:12px;margin:20px 0}.card{border:1px solid #ddd;padding:12px;flex:1}.card b{display:block;font-size:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f1f5f9}.right{text-align:right}@media print{button{display:none}}</style></head><body><h1>${cfg.name || 'GlasirEs'}</h1><div class="muted">LAPORAN INVOICE PELANGGAN BELUM LUNAS</div><div class="muted">Dicetak: ${new Date().toLocaleString('id-ID')}</div><div class="cards"><div class="card">Total Pelanggan Invoice<b>${approved.length}</b></div><div class="card">Total Invoice<b>${rupiah(totalAll)}</b></div><div class="card">Belum Lunas<b>${rupiah(unpaidTotal)}</b></div><div class="card">Sudah Lunas<b>${rupiah(paidTotal)}</b></div></div><p>Siap ditagih: <b>${dueNow.length}</b> pelanggan · Belum jatuh tempo: <b>${notYet.length}</b> pelanggan.</p><table><thead><tr><th>No</th><th>Pelanggan</th><th>Kontak</th><th>Jatuh Tempo</th><th>Nilai Tagihan</th><th>Driver</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="7">Tidak ada pelanggan belum lunas.</td></tr>'}</tbody></table><br><button onclick="window.print()">🖨 Cetak</button></body></html>`); w.document.close(); w.focus(); }; return React.createElement(Card, { className: "mb-5 border-2 border-sky-100" },
            React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-3 mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "\uD83D\uDCCB INVOICE PELANGGAN \u2014 LAPORAN"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Semua pelanggan invoice aktif, termasuk yang belum ditagih karena belum jatuh tempo.")),
                React.createElement(Btn, { tone: "accent", onClick: printUnpaid }, "\uD83D\uDDA8 Print Laporan Belum Lunas")),
            React.createElement("div", { className: "grid md:grid-cols-4 gap-3" },
                React.createElement("div", { className: "p-4 border rounded-xl" },
                    React.createElement("small", null, "TOTAL INVOICE"),
                    React.createElement("b", { className: "block text-xl" }, rupiah(totalAll)),
                    React.createElement("span", { className: "text-xs" }, "Semua pelanggan invoice")),
                React.createElement("div", { className: "p-4 border rounded-xl" },
                    React.createElement("small", null, "TOTAL BELUM LUNAS"),
                    React.createElement("b", { className: "block text-xl text-amber-700" }, rupiah(unpaidTotal)),
                    React.createElement("span", { className: "text-xs" },
                        unpaid.length,
                        " pelanggan")),
                React.createElement("div", { className: "p-4 border rounded-xl" },
                    React.createElement("small", null, "TOTAL SUDAH LUNAS"),
                    React.createElement("b", { className: "block text-xl text-emerald-700" }, rupiah(paidTotal)),
                    React.createElement("span", { className: "text-xs" },
                        paid.length,
                        " pelanggan")),
                React.createElement("div", { className: "p-4 border rounded-xl" },
                    React.createElement("small", null, "SIAP DITAGIH"),
                    React.createElement("b", { className: "block text-xl" }, dueNow.length),
                    React.createElement("span", { className: "text-xs" }, "Belum ditagih / tugas belum lunas"))),
            React.createElement("div", { className: "mt-4 p-3 rounded-xl bg-slate-50 border text-sm" },
                React.createElement("b", null, "Belum jatuh tempo:"),
                " ",
                notYet.length,
                " pelanggan \u00B7 ",
                React.createElement("b", null, "Belum lunas:"),
                " ",
                unpaid.length,
                " pelanggan \u00B7 ",
                React.createElement("b", null, "Sudah lunas:"),
                " ",
                paid.length,
                " pelanggan")); })(),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "flex flex-wrap justify-between gap-3 mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "Input Pelanggan Invoice oleh Admin"),
                    React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Jika Admin yang input, data langsung aktif sebagai pelanggan invoice.")),
                React.createElement(Pill, { tone: "approved" },
                    "Harga ",
                    rupiah(price),
                    "/kantong")),
            React.createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3" },
                React.createElement(Field, { label: "Nama Pelanggan / Toko" },
                    React.createElement("input", { className: inputCls, value: name, onChange: e => setName(e.target.value) })),
                React.createElement(Field, { label: "No. HP" },
                    React.createElement("input", { className: inputCls, value: phone, onChange: e => setPhone(e.target.value) })),
                React.createElement(Field, { label: "Alamat" },
                    React.createElement("input", { className: inputCls, value: address, onChange: e => setAddress(e.target.value) })),
                React.createElement(Field, { label: "Jatuh Tempo" },
                    React.createElement("input", { type: "date", className: inputCls, value: due, onChange: e => setDue(e.target.value) })),
                React.createElement(Field, { label: "Catatan" },
                    React.createElement("input", { className: inputCls, value: note, onChange: e => setNote(e.target.value) }))),
            React.createElement(Btn, { tone: "accent", onClick: create }, "\u2795 Simpan Pelanggan & Buat Invoice")),
        pendingBills.length > 0 && React.createElement(Card, { className: "mb-5 border-2 border-amber-200" },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "\u23F3 Menunggu ACC Admin"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Data yang dibuat Driver belum masuk daftar pelanggan aktif sampai disetujui.")),
                React.createElement(Pill, { tone: "pending" },
                    pendingBills.length,
                    " pengajuan")),
            React.createElement("div", { className: "space-y-3" }, pendingBills.map(b => React.createElement("div", { key: b.id, className: "p-4 rounded-2xl border bg-amber-50/70" },
                React.createElement("div", { className: "flex flex-wrap justify-between gap-3" },
                    React.createElement("div", null,
                        React.createElement("b", null, b.customerName),
                        React.createElement("div", { className: "text-xs text-slate-600" },
                            b.invoiceNo,
                            " \u00B7 ",
                            b.qty,
                            " kantong \u00B7 ",
                            rupiah(b.total)),
                        React.createElement("div", { className: "text-xs mt-1" },
                            "Dibuat oleh: ",
                            React.createElement("b", null, b.createdByName || '-'),
                            " \u00B7 Jatuh tempo: ",
                            b.dueDate || '-')),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(Btn, { tone: "accent", onClick: () => approve(b) }, "\u2713 ACC & Masukkan Pelanggan"),
                        React.createElement(Btn, { tone: "danger", onClick: () => reject(b) }, "Tolak"))),
                b.note && React.createElement("div", { className: "mt-2 text-xs bg-white/70 rounded-lg p-2" },
                    "\uD83D\uDCDD ",
                    b.note))))),
        paymentReports.filter(x => x.status === 'pending').length > 0 && React.createElement(Card, { className: "mb-5 border-2 border-sky-200" },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "\uD83D\uDCB0 Laporan Pembayaran dari Driver"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Driver melaporkan pelanggan sudah membayar. Invoice menjadi LUNAS setelah Admin ACC.")),
                React.createElement(Pill, { tone: "pending" },
                    paymentReports.filter(x => x.status === 'pending').length,
                    " menunggu ACC")),
            React.createElement("div", { className: "space-y-3" }, paymentReports.filter(x => x.status === 'pending').map(pr => React.createElement("div", { key: pr.id, className: "p-4 rounded-2xl border bg-sky-50/70 flex flex-wrap justify-between gap-3 items-center" },
                React.createElement("div", null,
                    React.createElement("b", null, pr.customerName),
                    React.createElement("div", { className: "text-xs text-slate-600" },
                        pr.invoiceNo,
                        " \u00B7 ",
                        rupiah(pr.total),
                        " \u00B7 Dilaporkan ",
                        pr.driverName),
                    React.createElement("div", { className: "text-xs mt-1" },
                        "Waktu: ",
                        waktu(pr.paidAt),
                        " ",
                        pr.note ? `· ${pr.note}` : '')),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(Btn, { tone: "accent", onClick: () => approvePayment(pr) }, "\u2713 ACC Pembayaran"),
                    React.createElement(Btn, { tone: "danger", onClick: () => rejectPayment(pr) }, "Tolak")))))),
        React.createElement(Card, null,
            React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-3 mb-4" },
                React.createElement("div", null,
                    React.createElement("b", null, "\uD83D\uDC65 Daftar Pelanggan Invoice"),
                    React.createElement("div", { className: "text-xs text-slate-500" }, "Admin cukup melihat dan mencari nama pelanggan; status pembayaran terlihat jelas.")),
                React.createElement("div", { className: "flex gap-2 text-xs" },
                    React.createElement(Pill, { tone: "done" },
                        "LUNAS ",
                        paidCount),
                    React.createElement(Pill, { tone: "pending" },
                        "BELUM LUNAS ",
                        unpaidCount))),
            React.createElement("div", { className: "mb-4" },
                React.createElement("input", { className: inputCls, value: search, onChange: e => setSearch(e.target.value), placeholder: "\uD83D\uDD0E Cari nama pelanggan atau nomor invoice..." })),
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full text-sm" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "text-left text-slate-400 text-xs border-b" },
                            React.createElement("th", { className: "py-3" }, "Pelanggan"),
                            React.createElement("th", null, "Invoice"),
                            React.createElement("th", null, "Jatuh Tempo"),
                            React.createElement("th", null, "Total Invoice"),
                            React.createElement("th", null, "Belum Lunas"),
                            React.createElement("th", null, "Sudah Lunas"),
                            React.createElement("th", null, "Status"),
                            React.createElement("th", null, "Penagih / Tugas"),
                            React.createElement("th", null, "Aksi"))),
                    React.createElement("tbody", null,
                        filtered.map(b => React.createElement("tr", { key: b.id, className: "border-b border-slate-100" },
                            React.createElement("td", { className: "py-3" },
                                React.createElement("b", null, b.customerName),
                                React.createElement("div", { className: "text-xs text-slate-400" }, b.customerPhone || '-')),
                            React.createElement("td", null, b.invoiceNo),
                            React.createElement("td", null, b.dueDate || '-'),
                            React.createElement("td", null,
                                React.createElement("b", null, rupiah(b.total))),
                            React.createElement("td", null, b.status === 'paid' ? React.createElement("span", { className: "text-slate-400" }, "Rp 0") : React.createElement("span", { className: "text-amber-700 font-semibold" }, rupiah(b.total))),
                            React.createElement("td", null, b.status === 'paid' ? React.createElement("span", { className: "text-emerald-700 font-semibold" }, rupiah(b.total)) : React.createElement("span", { className: "text-slate-400" }, "Rp 0")),
                            React.createElement("td", null,
                                React.createElement("div", null,
                                    React.createElement("select", { className: inputCls + ' !w-auto min-w-[150px] !py-1.5', value: b.collectorId || '', onChange: e => assign(b, e.target.value), disabled: b.status === 'paid' || !b.dueDate || String(b.dueDate || '').slice(0, 10) > tanggalLokal() || (+b.total || 0) <= 0 },
                                        React.createElement("option", { value: "" }, b.status === 'paid' ? 'Sudah Lunas' : (!b.dueDate || String(b.dueDate || '').slice(0, 10) > tanggalLokal()) ? 'Belum Jatuh Tempo' : 'Pilih Driver'),
                                        drivers.map(d => React.createElement("option", { key: d.id, value: d.id }, d.name))),
                                    b.status === 'paid' ? React.createElement("div", { className: "text-xs mt-1 text-emerald-700 font-semibold" },
                                        "TUGAS INVOICE LUNAS \u00B7 ",
                                        rupiah(b.total)) : b.collectorId ? React.createElement("div", { className: "text-xs mt-1 text-amber-700 font-semibold" },
                                        "TUGAS INVOICE BELUM LUNAS \u00B7 ",
                                        rupiah(b.total)) : React.createElement("div", { className: "text-xs mt-1" },
                                        React.createElement("span", { className: (!b.dueDate || String(b.dueDate || '').slice(0, 10) > tanggalLokal()) ? 'text-slate-500' : 'text-amber-700 font-semibold' }, (+b.total || 0) <= 0 ? 'Belum ada pesanan' : (!b.dueDate ? 'Jatuh tempo belum diisi' : String(b.dueDate || '').slice(0, 10) > tanggalLokal() ? 'Belum jatuh tempo' : 'Siap ditagihkan'))))),
                            React.createElement("td", null,
                                React.createElement("div", { className: "flex flex-wrap gap-1" },
                                    b.status !== 'paid' && React.createElement(Btn, { tone: "accent", className: "!py-1.5 text-xs", onClick: () => markPaid(b) }, "\u2713 Bayar / Lunas"),
                                    React.createElement(InvoicePrint, { bill: b, cfg: cfg }),
                                    b.status !== 'paid' && React.createElement(Btn, { tone: "danger", className: "!py-1.5 text-xs", onClick: () => remove(b) }, "Hapus"))))),
                        !filtered.length && React.createElement("tr", null,
                            React.createElement("td", { colSpan: "9", className: "text-center text-slate-400 py-8" }, "Tidak ada pelanggan invoice yang cocok.")))))));
}
function InvoiceCollectionDriver({ me }) {
    const all = toList(useDbList('invoiceCustomers')), allBills = all.filter(b => b.collectorId === me.id && b.approvalStatus === 'approved').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')), reports = toList(useDbList('invoicePaymentReports')).filter(x => x.driverId === me.id), [toast, show] = useToast(), [note, setNote] = useState(''), [period, setPeriod] = useState('all'), [periodDate, setPeriodDate] = useState(tanggalLokal());
    const bills = allBills;
    const filteredReports = reports.filter(r => driverPeriodMatch(r.paidAt || r.createdAt, period, periodDate));
    const paid = async (b) => {
        if (b.status === 'paid')
            return;
        const dueKey = String(b.dueDate || '').slice(0, 10), todayKey = tanggalLokal();
        if (dueKey && dueKey > todayKey)
            return show(`Belum jatuh tempo. Penagihan baru bisa dilakukan setelah ${b.dueDate}.`, 'err');
        const already = reports.some(x => x.invoiceId === b.id && x.status === 'pending');
        if (already)
            return show('Laporan pembayaran untuk invoice ini sudah menunggu ACC admin.', 'err');
        const r = await db.ref('invoicePaymentReports').push({ invoiceId: b.id, invoiceNo: b.invoiceNo, customerName: b.customerName, total: b.total, driverId: me.id, driverName: me.name, note: note.trim(), paidAt: Date.now(), status: 'pending', createdAt: Date.now() });
        await notify({ title: 'ACC pembayaran invoice diperlukan', message: `${me.name} melaporkan ${b.customerName} (${b.invoiceNo}) sudah membayar ${rupiah(b.total)}. Menunggu ACC admin.`, toRole: 'admin', fromUser: me.id, data: { paymentReportId: r.key, invoiceId: b.id }, menu: 'payments' });
        await notify({ title: 'ACC pembayaran invoice diperlukan', message: `${b.customerName} (${b.invoiceNo}) dilaporkan sudah membayar oleh ${me.name}. Menunggu ACC admin.`, toRole: 'superadmin', fromUser: me.id, data: { paymentReportId: r.key, invoiceId: b.id }, menu: 'payments' });
        await createAudit('invoice_payment_submit', `${b.invoiceNo} dilaporkan lunas oleh ${me.name}`, me);
        setNote('');
        show('Pembayaran dilaporkan ke admin dan menunggu ACC.');
    };
    const reportFor = id => reports.find(x => x.invoiceId === id && x.status === 'pending');
    const latestReportFor = id => reports.filter(x => x.invoiceId === id).sort((a, b) => (b.paidAt || b.createdAt || 0) - (a.paidAt || a.createdAt || 0))[0];
    const unpaid = bills.filter(b => b.status !== 'paid'), paidBills = bills.filter(b => b.status === 'paid');
    const unpaidTotal = unpaid.reduce((a, b) => a + (+b.total || 0), 0), paidTotal = paidBills.reduce((a, b) => a + (+b.total || 0), 0), hasTasks = bills.length > 0;
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Penagihan Invoice Saya"),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" },
                React.createElement("div", { className: "p-4 rounded-2xl bg-amber-50 border" },
                    React.createElement("small", null, "TOTAL INVOICE BELUM LUNAS"),
                    React.createElement("b", { className: "block text-xl text-amber-700" }, hasTasks ? rupiah(unpaidTotal) : ''),
                    React.createElement("span", { className: "text-xs" }, hasTasks ? `${unpaid.length} tugas` : '')),
                React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                    React.createElement("small", null, "TOTAL INVOICE LUNAS"),
                    React.createElement("b", { className: "block text-xl text-emerald-700" }, hasTasks ? rupiah(paidTotal) : ''),
                    React.createElement("span", { className: "text-xs" }, hasTasks ? `${paidBills.length} tugas` : '')),
                React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border" },
                    React.createElement("small", null, "TOTAL TUGAS INVOICE"),
                    React.createElement("b", { className: "block text-xl text-sky-700" }, hasTasks ? rupiah(unpaidTotal + paidTotal) : ''),
                    React.createElement("span", { className: "text-xs" }, hasTasks ? `${bills.length} tugas` : '')))),
        React.createElement(DriverHistoryFilter, { period: period, setPeriod: setPeriod, date: periodDate, setDate: setPeriodDate }),
        React.createElement("div", { className: "space-y-4" },
            bills.map(b => {
                const pr = reportFor(b.id), isPaid = b.status === 'paid';
                return React.createElement(Card, { key: b.id, className: isPaid ? 'border-l-4 border-emerald-400' : 'border-l-4 border-cyan-400' },
                    React.createElement("div", { className: "flex flex-wrap justify-between gap-4" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-xs text-slate-400" }, b.invoiceNo),
                            React.createElement("b", { className: "text-xl" }, b.customerName),
                            React.createElement("div", { className: "text-sm mt-1" },
                                b.customerPhone || '-',
                                " \u00B7 ",
                                b.customerAddress || 'Alamat belum diisi'),
                            React.createElement("div", { className: "mt-2 text-sm" },
                                "Nilai Tugas Invoice: ",
                                React.createElement("b", null, rupiah(b.total)),
                                " \u00B7 Jatuh tempo: ",
                                React.createElement("b", null, b.dueDate || '-')),
                            React.createElement("div", { className: "text-xs text-slate-500 mt-1" },
                                "Status Penagihan: ",
                                latestReportFor(b.id) ? (latestReportFor(b.id).status === 'approved' ? 'LUNAS' : latestReportFor(b.id).status === 'rejected' ? 'DITOLAK' : 'MENUNGGU ACC ADMIN') : '—')),
                        React.createElement(Pill, { tone: isPaid ? 'done' : pr ? 'pending' : 'approved' }, isPaid ? 'INVOICE LUNAS' : pr ? 'MENUNGGU ACC ADMIN' : 'INVOICE BELUM LUNAS')),
                    !isPaid && React.createElement("div", { className: "mt-4 grid md:grid-cols-[1fr_auto] gap-3 items-end" },
                        React.createElement(Field, { label: "Catatan saat pembayaran" },
                            React.createElement("input", { className: inputCls, value: note, onChange: e => setNote(e.target.value), placeholder: "Contoh: dibayar di toko" })),
                        React.createElement(Btn, { tone: "accent", disabled: !!pr || !!(b.dueDate && String(b.dueDate || '').slice(0, 10) > tanggalLokal()), onClick: () => paid(b) }, pr ? '⏳ Menunggu ACC Admin' : (b.dueDate && String(b.dueDate || '').slice(0, 10) > tanggalLokal()) ? '⏳ Belum Jatuh Tempo' : '✓ Laporkan Pelanggan Sudah Bayar')),
                    isPaid && React.createElement("div", { className: "mt-3 text-xs text-emerald-700" },
                        "Lunas ",
                        waktu(b.paidAt),
                        " \u00B7 Pembayaran oleh ",
                        b.paidByName || 'Admin/Driver'),
                    latestReportFor(b.id) && React.createElement("div", { className: "mt-3 p-3 rounded-xl bg-slate-50 border text-xs" },
                        React.createElement("b", null, "Riwayat Penagihan"),
                        React.createElement("div", { className: "mt-1" },
                            latestReportFor(b.id).status === 'approved' ? 'SELESAI' : latestReportFor(b.id).status === 'rejected' ? 'DITOLAK' : 'MENUNGGU ACC ADMIN',
                            " \u00B7 Dilaporkan ",
                            waktu(latestReportFor(b.id).paidAt || latestReportFor(b.id).createdAt),
                            latestReportFor(b.id).note ? ` · ${latestReportFor(b.id).note}` : '')));
            }),
            !bills.length && React.createElement(Card, null,
                React.createElement("div", { className: "text-center text-slate-400 py-8" }, "Belum ada tugas invoice pada periode ini."))),
        React.createElement(Card, { className: "mt-5" },
            React.createElement("b", null, "Riwayat Penagihan"),
            React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Riwayat laporan pembayaran yang Anda kirim."),
            React.createElement("div", { className: "space-y-2 mt-4" },
                filteredReports.sort((a, b) => (b.paidAt || b.createdAt || 0) - (a.paidAt || a.createdAt || 0)).map(r => React.createElement("div", { key: r.id, className: "p-4 rounded-xl border" },
                    React.createElement("div", { className: "flex flex-wrap justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("b", null, r.customerName || '-'),
                            React.createElement("div", { className: "text-xs text-slate-500" },
                                r.invoiceNo || '-',
                                " \u00B7 ",
                                rupiah(r.total || 0)),
                            React.createElement("div", { className: "text-xs mt-1" },
                                "Dilaporkan: ",
                                waktu(r.paidAt || r.createdAt))),
                        React.createElement(Pill, { tone: r.status === 'approved' ? 'done' : r.status === 'rejected' ? 'rejected' : 'pending' }, r.status === 'approved' ? 'SELESAI' : r.status === 'rejected' ? 'DITOLAK' : 'MENUNGGU ACC ADMIN')))),
                !filteredReports.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Belum ada riwayat penagihan pada periode ini."))));
}
function CompanySettings({ me }) { const cfg = useDbValue('config/company', {}), price = useDbValue('config/pricePerBag', 15000), [form, setForm] = useState({ name: '', address: '', phone: '', logo: '', reportColor: '#1c4a73' }), [p, setP] = useState(price), [toast, show] = useToast(); useEffect(() => setForm({ ...cfg }), [cfg]); useEffect(() => setP(price), [price]); const save = async () => { await db.ref('config/company').set(form); await db.ref('config/pricePerBag').set(+p || 0); await createAudit('company_settings', 'Memperbarui identitas perusahaan dan harga', me); show('Pengaturan disimpan.'); }; const logo = e => { var _a; const f = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]; if (!f)
    return; const r = new FileReader(); r.onload = () => setForm(x => ({ ...x, logo: r.result })); r.readAsDataURL(f); }; return React.createElement("div", null,
    toast,
    React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Pengaturan Perusahaan & Harga"),
    React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" },
        React.createElement(Card, null,
            React.createElement("b", null, "Identitas Perusahaan"),
            React.createElement(Field, { label: "Nama Perusahaan" },
                React.createElement("input", { className: inputCls, value: form.name || '', onChange: e => setForm({ ...form, name: e.target.value }) })),
            React.createElement(Field, { label: "Alamat" },
                React.createElement("textarea", { className: inputCls, rows: "3", value: form.address || '', onChange: e => setForm({ ...form, address: e.target.value }) })),
            React.createElement(Field, { label: "Telepon / Kontak" },
                React.createElement("input", { className: inputCls, value: form.phone || '', onChange: e => setForm({ ...form, phone: e.target.value }) })),
            React.createElement(Field, { label: "Logo" },
                React.createElement("input", { type: "file", accept: "image/*", onChange: logo })),
            form.logo && React.createElement("img", { src: form.logo, className: "w-20 h-20 object-contain border rounded-xl p-2" }),
            React.createElement(Field, { label: "Warna Laporan" },
                React.createElement("input", { type: "color", value: form.reportColor || '#1c4a73', onChange: e => setForm({ ...form, reportColor: e.target.value }) }))),
        React.createElement(Card, null,
            React.createElement("b", null, "Harga Jual"),
            React.createElement(Field, { label: "Harga per Kantong" },
                React.createElement("input", { type: "number", className: inputCls, value: p, onChange: e => setP(e.target.value) })),
            React.createElement("div", { className: "text-3xl font-display font-bold mb-2" }, rupiah(p)),
            React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Perubahan harga hanya berlaku untuk transaksi baru. Harga transaksi lama tetap tersimpan."),
            React.createElement(Btn, { tone: "accent", onClick: save }, "Simpan Pengaturan")))); }
function PaymentManager() {
    const ds = toList(useDbList('deliveries')).filter(d => (d.paymentMethod === 'invoice' || d.paymentMethod === 'wait_cash') && d.paymentStatus !== 'paid'), invoices = toList(useDbList('invoiceCustomers')).filter(b => b.status !== 'paid' && b.approvalStatus === 'approved'), [toast, show] = useToast();
    const pay = async (d) => { await db.ref('deliveries/' + d.id).update({ paymentStatus: 'paid', waitCashStatus: d.paymentMethod === 'wait_cash' ? 'paid' : (d.waitCashStatus || null), paidAt: Date.now(), paidBy: 'admin', paidByName: 'Admin' }); await notify({ title: d.paymentMethod === 'wait_cash' ? 'WAIT CASH lunas' : 'Invoice lunas', message: `${d.paymentMethod === 'wait_cash' ? 'WAIT CASH' : 'Invoice'} ${d.customerName} sebesar ${rupiah(d.total)} sudah lunas.`, toRole: 'admin', menu: 'deliveries' }); show(d.paymentMethod === 'wait_cash' ? 'WAIT CASH ditandai lunas.' : 'Invoice pengantaran ditandai lunas.'); };
    const payCustomer = async (b) => { await db.ref('invoiceCustomers/' + b.id).update({ status: 'paid', paidAt: Date.now(), paidBy: 'admin', paidByName: 'Admin', paymentSource: 'admin' }); show('Invoice pelanggan ditandai lunas.'); };
    return React.createElement("div", null,
        toast,
        React.createElement("h2", { className: "font-display font-bold text-xl mb-5" }, "Pembayaran Invoice"),
        React.createElement(Card, { className: "mb-5" },
            React.createElement("b", null, "Invoice Pelanggan"),
            React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "Menu ini tetap mendukung pembayaran invoice lama dari pengantaran dan invoice pelanggan."),
            React.createElement("div", { className: "space-y-2 mt-4" },
                invoices.map(b => React.createElement("div", { key: b.id, className: "flex justify-between items-center p-4 border rounded-xl" },
                    React.createElement("div", null,
                        React.createElement("b", null, b.customerName),
                        React.createElement("div", { className: "text-xs" },
                            b.invoiceNo,
                            " \u00B7 ",
                            rupiah(b.total),
                            " \u00B7 jatuh tempo ",
                            b.dueDate || '-')),
                    React.createElement(Btn, { tone: "accent", className: "!py-1 !px-3 text-xs", onClick: () => payCustomer(b) }, "Tandai Lunas"))),
                !invoices.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Tidak ada invoice pelanggan belum lunas."))),
        React.createElement(Card, null,
            React.createElement("b", null, "Invoice / WAIT CASH dari Pengantaran"),
            React.createElement("div", { className: "space-y-2 mt-4" },
                ds.map(d => React.createElement("div", { key: d.id, className: "flex justify-between items-center p-4 border rounded-xl" },
                    React.createElement("div", null,
                        React.createElement("b", null, d.customerName),
                        React.createElement("div", { className: "text-xs" },
                            d.driverName,
                            " \u00B7 ",
                            waktu(d.timestamp),
                            " \u00B7 ",
                            d.paymentMethod === 'wait_cash' ? 'WAIT CASH' : 'INVOICE')),
                    React.createElement("div", { className: "text-right" },
                        React.createElement("b", null, rupiah(d.total)),
                        React.createElement("br", null),
                        React.createElement(Btn, { tone: "accent", className: "!py-1 !px-3 text-xs mt-1", onClick: () => pay(d) }, "Tandai Lunas")))),
                !ds.length && React.createElement("div", { className: "text-center text-slate-400 py-6" }, "Tidak ada invoice pengantaran belum lunas."))));
}
function InvoiceCustomerAnalytics({ startTs, endTs, compact = false }) {
    const bills = toList(useDbList('invoiceCustomers')).filter(b => b.approvalStatus === 'approved' && b.status !== 'rejected');
    const total = bills.reduce((a, b) => a + (+b.total || 0), 0), paid = bills.filter(b => b.status === 'paid').reduce((a, b) => a + (+b.total || 0), 0), unpaid = Math.max(0, total - paid);
    const count = bills.length, paidCount = bills.filter(b => b.status === 'paid').length, unpaidCount = count - paidCount;
    const pct = (v, t) => t ? Math.round(v / t * 100) : 0;
    const dough = (a, b) => { const t = (+a || 0) + (+b || 0), pa = t ? pct(a, t) : 50; return { background: `conic-gradient(#22c55e 0 ${pa}%, #f59e0b ${pa}% 100%)` }; };
    return React.createElement(Card, { className: compact ? 'mb-4' : 'my-5' },
        React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-3 mb-4" },
            React.createElement("div", null,
                React.createElement("h3", { className: "font-bold" }, "\uD83E\uDDFE Pelaporan Invoice Pelanggan"),
                React.createElement("p", { className: "text-xs text-slate-500" }, "Seluruh pelanggan invoice yang sudah ACC dihitung, termasuk yang belum ditugaskan penagihan.")),
            React.createElement(Pill, null,
                count,
                " invoice")),
        React.createElement("div", { className: "grid md:grid-cols-4 gap-3 mb-5" },
            React.createElement("div", { className: "p-3 border rounded-xl" },
                React.createElement("small", null, "TOTAL INVOICE"),
                React.createElement("b", { className: "block text-lg" }, rupiah(total)),
                React.createElement("span", { className: "text-xs" },
                    count,
                    " pelanggan invoice")),
            React.createElement("div", { className: "p-3 border rounded-xl" },
                React.createElement("small", null, "TUGAS INVOICE LUNAS"),
                React.createElement("b", { className: "block text-lg text-emerald-700" }, rupiah(paid)),
                React.createElement("span", { className: "text-xs" },
                    paidCount,
                    " invoice \u00B7 ",
                    pct(paid, total),
                    "%")),
            React.createElement("div", { className: "p-3 border rounded-xl" },
                React.createElement("small", null, "TUGAS INVOICE BELUM LUNAS"),
                React.createElement("b", { className: "block text-lg text-amber-700" }, rupiah(unpaid)),
                React.createElement("span", { className: "text-xs" },
                    unpaidCount,
                    " invoice \u00B7 ",
                    pct(unpaid, total),
                    "%")),
            React.createElement("div", { className: "p-3 border rounded-xl" },
                React.createElement("small", null, "STATUS PELANGGAN"),
                React.createElement("b", { className: "block text-lg" },
                    paidCount,
                    " / ",
                    count),
                React.createElement("span", { className: "text-xs" }, "lunas / total pelanggan"))),
        React.createElement("div", { className: "grid md:grid-cols-2 gap-5" },
            React.createElement("div", null,
                React.createElement("div", { className: "text-sm font-semibold mb-3" }, "Diagram Status Invoice"),
                React.createElement("div", { className: "flex items-center gap-5" },
                    React.createElement("div", { className: "w-32 h-32 rounded-full relative", style: dough(paid, unpaid) },
                        React.createElement("div", { className: "absolute inset-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-center" },
                            "INVOICE",
                            React.createElement("br", null),
                            count)),
                    React.createElement("div", { className: "text-sm space-y-2" },
                        React.createElement("div", null,
                            "\uD83D\uDFE2 Lunas: ",
                            React.createElement("b", null, rupiah(paid)),
                            " (",
                            pct(paid, total),
                            "%)"),
                        React.createElement("div", null,
                            "\uD83D\uDFE1 Belum Lunas: ",
                            React.createElement("b", null, rupiah(unpaid)),
                            " (",
                            pct(unpaid, total),
                            "%)")))),
            React.createElement("div", null,
                React.createElement("div", { className: "text-sm font-semibold mb-3" }, "Kolom Status"),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", { className: "py-2" }, "Pelanggan"),
                                React.createElement("th", null, "Invoice"),
                                React.createElement("th", null, "Total Invoice"),
                                React.createElement("th", null, "Status Tugas"))),
                        React.createElement("tbody", null,
                            bills.slice().sort((a, b) => (b.assignedAt || b.createdAt || 0) - (a.assignedAt || a.createdAt || 0)).slice(0, 15).map(b => React.createElement("tr", { key: b.id, className: "border-b" },
                                React.createElement("td", { className: "py-2" }, b.customerName),
                                React.createElement("td", null, b.collectorId ? b.invoiceNo : '-'),
                                React.createElement("td", null, rupiah(b.total)),
                                React.createElement("td", null,
                                    React.createElement(Pill, { tone: b.status === 'paid' ? 'done' : 'pending' }, b.status === 'paid' ? 'TUGAS INVOICE LUNAS' : 'TUGAS INVOICE BELUM LUNAS')))),
                            !bills.length && React.createElement("tr", null,
                                React.createElement("td", { colSpan: "5", className: "py-5 text-center text-slate-400" }, "Belum ada invoice pada periode ini."))))))));
}
function Reports({ me }) {
    const ds = toList(useDbList('deliveries')), us = toList(useDbList('users')), wh = toList(useDbList('warehouse/history')), rr = toList(useDbList('returnRequests')), invoiceBills = toList(useDbList('invoiceCustomers')), cfg = useDbValue('config/company', {}), [period, setPeriod] = useState('month'), [date, setDate] = useState(tanggalLokal()), [userId, setUserId] = useState(''), [pay, setPay] = useState(''), [toast, show] = useToast();
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
    const selectedUser = us.find(u => u.id === userId), isGudang = (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.role) === 'gudang', warehouseRows = wh.filter(x => x.timestamp >= start.getTime() && x.timestamp <= end.getTime() && (!userId || x.by === userId)), returnRows = rr.filter(x => (x.receivedAt || x.requestedAt || 0) >= start.getTime() && (x.receivedAt || x.requestedAt || 0) <= end.getTime() && (!userId || x.receivedBy === userId)), rows = ds.filter(d => d.timestamp >= start.getTime() && d.timestamp <= end.getTime() && (!userId || (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.role) !== 'gudang' && d.driverId === userId) && (!pay || d.paymentMethod === pay));
    const invoiceRows = isGudang ? [] : invoiceBills.filter(b => { const t = +((b.assignedAt || b.createdAt) || 0); return t >= start.getTime() && t <= end.getTime() && b.approvalStatus === 'approved' && b.collectorId && (!userId || b.collectorId === userId); });
    const directCash = isGudang ? 0 : rows.filter(d => d.paymentMethod === 'cash').reduce((a, d) => a + (+d.total || 0), 0), waitTotal = isGudang ? 0 : rows.filter(d => d.paymentMethod === 'wait_cash').reduce((a, d) => a + (+d.total || 0), 0), waitPaid = isGudang ? 0 : rows.filter(d => d.paymentMethod === 'wait_cash' && d.paymentStatus === 'paid').reduce((a, d) => a + (+d.total || 0), 0), waitCash = Math.max(0, waitTotal - waitPaid), waitCashLunas = waitPaid, cash = directCash, taskInvoiceTotal = invoiceRows.reduce((a, b) => a + (+b.total || 0), 0), taskInvoiceUnpaid = invoiceRows.filter(b => b.status !== 'paid').reduce((a, b) => a + (+b.total || 0), 0), taskInvoicePaid = invoiceRows.filter(b => b.status === 'paid').reduce((a, b) => a + (+b.total || 0), 0), paymentToAdmin = isGudang ? 0 : cash + waitCashLunas + taskInvoicePaid, unpaid = taskInvoiceUnpaid + waitCash;
    const print = () => window.print(), exportPdf = () => { try {
        const { jsPDF } = window.jspdf, p = new jsPDF();
        p.setFont('helvetica', 'bold');
        p.setFontSize(18);
        p.text(cfg.name || 'GlasirEs', 15, 18);
        p.setFontSize(10);
        p.setFont('helvetica', 'normal');
        p.text(`LAPORAN ${period.toUpperCase()}`, 15, 42);
        p.text(`Periode: ${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`, 15, 48);
        p.text(`User: ${selectedUser ? selectedUser.name + ' (' + ROLES[selectedUser.role] + ')' : 'Semua'}`, 15, 58);
        if (!isGudang) {
            p.text(`CASH: ${rupiah(cash)} | WAIT CASH LUNAS: ${rupiah(waitCashLunas)}`, 15, 70);
            p.text(`TUGAS INVOICE BELUM LUNAS: ${rupiah(taskInvoiceUnpaid)} | TUGAS INVOICE LUNAS: ${rupiah(taskInvoicePaid)}`, 15, 76);
            p.text(`TOTAL PAYMENT TO ADMIN: ${rupiah(paymentToAdmin)}`, 15, 82);
        }
        let y = 98;
        rows.slice(0, 30).forEach((d, i) => { p.text(`${i + 1}. ${new Date(d.timestamp).toLocaleDateString('id-ID')} | Driver: ${String(d.driverName || '-')} | Pelanggan: ${String(d.customerNameFull || d.customerName || '-')} | Lokasi: ${String(d.locationFull || d.location || '-')} | ${d.qty} | ${rupiah(d.total)} | ${d.paymentMethod}`, 15, y); y += 6; if (y > 285) {
            p.addPage();
            y = 18;
        } });
        p.save('laporan-glasires.pdf');
    }
    catch (e) {
        show('PDF gagal: ' + e.message, 'err');
    } };
    const mi = warehouseRows.filter(x => x.type === 'masuk').reduce((a, x) => a + (+x.qty || 0), 0), ke = warehouseRows.filter(x => x.type === 'keluar').reduce((a, x) => a + (+x.qty || 0), 0), kb = returnRows.filter(x => x.status === 'received').reduce((a, x) => a + (+x.qty || 0), 0);
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("div", { className: "no-print" },
            React.createElement("h2", { className: "font-display font-bold text-xl mb-5" },
                "Laporan ",
                selectedUser ? `— ${selectedUser.name}` : ''),
            React.createElement(Card, { className: "mb-5" },
                React.createElement("div", { className: "grid md:grid-cols-5 gap-3" },
                    React.createElement(Field, { label: "Periode" },
                        React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                            React.createElement("option", { value: "day" }, "Harian"),
                            React.createElement("option", { value: "month" }, "Bulanan"),
                            React.createElement("option", { value: "year" }, "Tahunan"))),
                    React.createElement(Field, { label: "Tanggal acuan" },
                        React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) })),
                    React.createElement(Field, { label: "User / Driver" },
                        React.createElement("select", { className: inputCls, value: userId, onChange: e => setUserId(e.target.value) },
                            React.createElement("option", { value: "" }, "Semua"),
                            us.filter(u => u.role === 'driver' || u.role === 'gudang').map(u => React.createElement("option", { value: u.id, key: u.id },
                                u.name,
                                " \u2014 ",
                                ROLES[u.role])))),
                    React.createElement(Field, { label: "Pembayaran" },
                        React.createElement("select", { className: inputCls, value: pay, onChange: e => setPay(e.target.value) },
                            React.createElement("option", { value: "" }, "Semua"),
                            React.createElement("option", { value: "cash" }, "CASH"),
                            React.createElement("option", { value: "wait_cash" }, "WAIT CASH"),
                            React.createElement("option", { value: "invoice" }, "INVOICE"))),
                    React.createElement("div", { className: "flex items-end gap-2 mb-3" },
                        React.createElement(Btn, { tone: "accent", onClick: print }, "\uD83D\uDDA8 Print / PDF"),
                        React.createElement(Btn, { tone: "ghost", onClick: exportPdf }, "PDF"))))),
        React.createElement("div", { className: "report-page report-print-area admin-report-print-area", style: { '--report-color': cfg.reportColor || '#1c4a73' } },
            React.createElement("div", { className: "report-head" },
                cfg.logo && React.createElement("img", { className: "report-logo", src: cfg.logo }),
                React.createElement("div", null,
                    React.createElement("div", { className: "report-title text-2xl font-bold" }, cfg.name || 'GlasirEs'),
                    React.createElement("div", { className: "text-sm" }, cfg.address || 'Alamat perusahaan belum diatur'),
                    React.createElement("div", { className: "text-sm" }, cfg.phone || ''))),
            React.createElement("h1", { className: "text-xl font-bold mt-6" }, isGudang ? 'LAPORAN AKTIVITAS GUDANG' : 'LAPORAN TRANSAKSI & TUGAS INVOICE'),
            React.createElement("p", { className: "text-sm" },
                "Periode: ",
                start.toLocaleDateString('id-ID'),
                " s/d ",
                end.toLocaleDateString('id-ID')),
            !isGudang && userId === '' && React.createElement(WarehouseProductBreakdown, { startTs: start.getTime(), endTs: end.getTime(), includeAll: true }),
            !isGudang && React.createElement("div", { className: "admin-report-hide-print" },
                React.createElement(InvoiceCustomerAnalytics, { startTs: start.getTime(), endTs: end.getTime(), compact: true })),
            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-8 gap-3 my-5 admin-report-hide-print" },
                React.createElement("div", { className: "p-3 border rounded-xl" },
                    React.createElement("small", null, "Transaksi"),
                    React.createElement("b", { className: "block text-xl" }, rows.length)),
                React.createElement("div", { className: "p-3 border rounded-xl" },
                    React.createElement("small", null, "Kantong"),
                    React.createElement("b", { className: "block text-xl" }, rows.reduce((a, d) => a + (+d.qty || 0), 0))),
                !isGudang && React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "TOTAL CASH"),
                        React.createElement("b", { className: "block" }, rupiah(cash))),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "WAIT CASH"),
                        React.createElement("b", { className: "block text-amber-700" }, rupiah(waitCash)),
                        React.createElement("span", { className: "text-xs" }, "Belum lunas")),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "WAIT CASH LUNAS"),
                        React.createElement("b", { className: "block text-emerald-700" }, rupiah(waitCashLunas))),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "TOTAL INVOICE"),
                        React.createElement("b", { className: "block" }, rupiah(taskInvoiceTotal))),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "TUGAS INVOICE BELUM LUNAS"),
                        React.createElement("b", { className: "block text-amber-700" }, rupiah(taskInvoiceUnpaid))),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "TOTAL TUGAS INVOICE LUNAS"),
                        React.createElement("b", { className: "block text-emerald-700" }, rupiah(taskInvoicePaid))),
                    React.createElement("div", { className: "p-3 rounded-xl bg-glacier-900 text-white" },
                        React.createElement("small", { className: "text-frost-200" }, "TOTAL PAYMENT TO ADMIN"),
                        React.createElement("b", { className: "block" }, rupiah(paymentToAdmin)),
                        React.createElement("span", { className: "text-xs text-frost-200/70" }, "Cash + Wait Cash Lunas + Tugas Invoice Lunas")))),
            isGudang ? React.createElement(React.Fragment, null,
                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 my-5" },
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "MASUK"),
                        React.createElement("b", { className: "block text-xl text-emerald-700" }, mi)),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "KELUAR"),
                        React.createElement("b", { className: "block text-xl text-rose-700" }, ke)),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "KEMBALI"),
                        React.createElement("b", { className: "block text-xl text-violet-700" }, kb)),
                    React.createElement("div", { className: "p-3 border rounded-xl" },
                        React.createElement("small", null, "AKTIVITAS"),
                        React.createElement("b", { className: "block text-xl" }, warehouseRows.length + returnRows.filter(x => x.status === 'received').length))),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", null, "No"),
                                React.createElement("th", null, "Tanggal & Jam"),
                                React.createElement("th", null, "Jenis"),
                                React.createElement("th", null, "Jumlah"),
                                React.createElement("th", null, "Keterangan"))),
                        React.createElement("tbody", null,
                            warehouseRows.map((x, i) => React.createElement("tr", { key: x.id, className: "border-b" },
                                React.createElement("td", null, i + 1),
                                React.createElement("td", null, waktu(x.timestamp)),
                                React.createElement("td", null, x.type.toUpperCase()),
                                React.createElement("td", null,
                                    x.qty,
                                    " kantong"),
                                React.createElement("td", null, x.driverName || x.note || '-'))),
                            returnRows.filter(x => x.status === 'received').map((x, i) => React.createElement("tr", { key: 'ret' + x.id, className: "border-b" },
                                React.createElement("td", null, warehouseRows.length + i + 1),
                                React.createElement("td", null, waktu(x.receivedAt || x.requestedAt)),
                                React.createElement("td", null, "KEMBALI"),
                                React.createElement("td", null,
                                    x.qty,
                                    " kantong"),
                                React.createElement("td", null, x.driverName || '-')))))),
                React.createElement(WarehouseProductBreakdown, { startTs: start.getTime(), endTs: end.getTime(), includeAll: true })) : React.createElement(React.Fragment, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", null, "No"),
                                React.createElement("th", null, "Tanggal & Jam"),
                                React.createElement("th", null, "Driver"),
                                React.createElement("th", null, "Pelanggan"),
                                React.createElement("th", null, "Lokasi"),
                                React.createElement("th", null, "Jenis Produk"),
                                React.createElement("th", null, "Qty"),
                                React.createElement("th", null, "Total"),
                                React.createElement("th", null, "Bayar"))),
                        React.createElement("tbody", null, rows.map((d, i) => React.createElement("tr", { key: d.id, className: "border-b" },
                            React.createElement("td", null, i + 1),
                            React.createElement("td", null, waktu(d.timestamp)),
                            React.createElement("td", null, d.driverName),
                            React.createElement("td", { className: "full-customer-location", title: String(d.customerNameFull || d.customerName || '') }, String(d.customerNameFull || d.customerName || '')),
                            React.createElement("td", { className: "full-customer-location", title: String(d.locationFull || d.location || '') }, String(d.locationFull || d.location || '-')),
                            React.createElement("td", null, d.productName || d.productType || d.product || '-'),
                            React.createElement("td", null, d.qty),
                            React.createElement("td", null, rupiah(d.total)),
                            React.createElement("td", null, d.paymentMethod === 'invoice' ? `INVOICE (${d.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM'})` : d.paymentMethod === 'wait_cash' ? `WAIT CASH (${d.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM'})` : 'CASH')))))),
                React.createElement("div", { className: "mt-5 overflow-x-auto" },
                    React.createElement("h3", { className: "font-bold mb-2" }, "Detail Tugas Invoice"),
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", null, "Pelanggan"),
                                React.createElement("th", null, "Invoice"),
                                React.createElement("th", null, "Driver"),
                                React.createElement("th", null, "Total Invoice"),
                                React.createElement("th", null, "Status"))),
                        React.createElement("tbody", null,
                            invoiceRows.map(b => React.createElement("tr", { key: b.id, className: "border-b" },
                                React.createElement("td", null, b.customerName),
                                React.createElement("td", null, b.invoiceNo),
                                React.createElement("td", null, b.collectorName),
                                React.createElement("td", null, rupiah(b.total)),
                                React.createElement("td", null, b.status === 'paid' ? React.createElement(Pill, { tone: "done" }, "TUGAS INVOICE LUNAS") : React.createElement(Pill, { tone: "pending" }, "TUGAS INVOICE BELUM LUNAS")))),
                            !invoiceRows.length && React.createElement("tr", null,
                                React.createElement("td", { colSpan: "5", className: "text-center py-5 text-slate-400" }, "Tidak ada tugas invoice pada periode ini."))))),
                React.createElement("div", { className: "mt-5 text-right" },
                    React.createElement("b", null,
                        "Total CASH: ",
                        rupiah(cash)),
                    React.createElement("br", null),
                    React.createElement("b", null,
                        "Total WAIT CASH: ",
                        rupiah(waitCash)),
                    React.createElement("br", null),
                    React.createElement("b", null,
                        "Total WAIT CASH LUNAS: ",
                        rupiah(waitCashLunas)),
                    React.createElement("br", null),
                    React.createElement("b", null,
                        "Total INVOICE: ",
                        rupiah(taskInvoiceTotal)),
                    React.createElement("br", null),
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
                    React.createElement("div", { className: "text-xs" }, ROLES[me.role])))));
}
function PaymentReport({ me }) { return React.createElement(Reports, { me: me }); }
function SuperReports({ me }) {
    const ds = toList(useDbList('deliveries')), us = toList(useDbList('users')), wh = toList(useDbList('warehouse/history')), rr = toList(useDbList('returnRequests')), cfg = useDbValue('config/company', {}), [period, setPeriod] = useState('month'), [date, setDate] = useState(new Date().toISOString().slice(0, 10)), [driverId, setDriverId] = useState(''), [report, setReport] = useState('revenue'), [selectedUsers, setSelectedUsers] = useState([]), [toast, show] = useToast();
    const range = useMemo(() => {
        const base = new Date(date + 'T00:00:00');
        let a = new Date(base), b = new Date(base);
        if (period === 'day') {
            a.setHours(0, 0, 0, 0);
            b.setHours(23, 59, 59, 999);
        }
        else if (period === 'month') {
            a = new Date(base.getFullYear(), base.getMonth(), 1);
            b = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        else {
            a = new Date(base.getFullYear(), 0, 1);
            b = new Date(base.getFullYear(), 11, 31, 23, 59, 59, 999);
        }
        return { start: a.getTime(), end: b.getTime(), a, b };
    }, [period, date]);
    const inRange = x => { const t = +x || 0; return t >= range.start && t <= range.end; };
    const rows = ds.filter(d => inRange(d.timestamp) && (!driverId || d.driverId === driverId));
    const warehouse = wh.filter(x => inRange(x.timestamp));
    const returns = rr.filter(x => inRange(x.requestedAt || x.receivedAt));
    const revenue = rows.reduce((a, d) => a + (+d.total || 0), 0);
    const cash = rows.filter(d => d.paymentMethod === 'cash').reduce((a, d) => a + (+d.total || 0), 0);
    const invoice = rows.filter(d => d.paymentMethod === 'invoice').reduce((a, d) => a + (+d.total || 0), 0);
    const waitCash = rows.filter(d => d.paymentMethod === 'wait_cash').reduce((a, d) => a + (+d.total || 0), 0);
    const waitCashPaid = rows.filter(d => d.paymentMethod === 'wait_cash' && d.paymentStatus === 'paid').reduce((a, d) => a + (+d.total || 0), 0);
    const paid = rows.filter(d => (d.paymentMethod === 'invoice' || d.paymentMethod === 'wait_cash') && d.paymentStatus === 'paid').reduce((a, d) => a + (+d.total || 0), 0);
    const unpaid = Math.max(0, invoice + waitCash - paid);
    const qty = rows.reduce((a, d) => a + (+d.qty || 0), 0);
    const masuk = warehouse.filter(x => x.type === 'masuk').reduce((a, x) => a + (+x.qty || 0), 0);
    const keluar = warehouse.filter(x => x.type === 'keluar').reduce((a, x) => a + (+x.qty || 0), 0);
    const kembali = returns.filter(x => x.status === 'received' || x.status === 'approved').reduce((a, x) => a + (+x.qty || 0), 0);
    const currentStock = useDbValue('warehouse/stock', 0);
    const drivers = us.filter(u => u.role === 'driver' && u.active !== false);
    const driverStats = drivers.map(u => {
        const r = rows.filter(d => d.driverId === u.id);
        const q = r.reduce((a, d) => a + (+d.qty || 0), 0);
        const val = r.reduce((a, d) => a + (+d.total || 0), 0);
        const p = r.filter(d => d.paymentStatus === 'paid' || d.paymentMethod === 'cash').reduce((a, d) => a + (+d.total || 0), 0);
        return { u, count: r.length, qty: q, value: val, paid: p, unpaid: Math.max(0, val - p) };
    }).sort((a, b) => b.value - a.value);
    const maxDriver = Math.max(1, ...driverStats.map(x => x.value));
    const pct = (v, total) => total ? Math.round(v / total * 100) : 0;
    const periodLabel = period === 'day' ? 'HARIAN' : period === 'month' ? 'BULANAN' : 'TAHUNAN';
    const money = n => rupiah(n || 0);
    const print = () => window.print();
    const exportPdf = () => {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const title = report === 'revenue' ? 'LAPORAN PENDAPATAN' : report === 'warehouse' ? 'LAPORAN GUDANG' : 'LAPORAN KINERJA DRIVER';
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(17);
            pdf.text(cfg.name || 'GlasirEs', 15, 16);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(cfg.address || '', 15, 22);
            pdf.text(cfg.phone || '', 15, 27);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(13);
            pdf.text(title, 15, 38);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`Periode ${periodLabel}: ${range.a.toLocaleDateString('id-ID')} s/d ${range.b.toLocaleDateString('id-ID')}`, 15, 44);
            let y = 54;
            if (report === 'revenue') {
                pdf.text(`Pendapatan: ${money(revenue)}`, 15, y);
                y += 6;
                pdf.text(`CASH: ${money(cash)} (${pct(cash, revenue)}%)`, 15, y);
                y += 6;
                pdf.text(`INVOICE: ${money(invoice)} (${pct(invoice, revenue)}%)`, 15, y);
                y += 6;
                pdf.text(`WAIT CASH: ${money(waitCash)} | BELUM LUNAS: ${money(Math.max(0, waitCash - waitCashPaid))}`, 15, y);
                y += 6;
                pdf.text(`LUNAS: ${money(paid)} (${pct(paid, invoice)}% dari invoice)`, 15, y);
                y += 6;
                pdf.text(`BELUM LUNAS: ${money(unpaid)} (${pct(unpaid, invoice)}% dari invoice)`, 15, y);
                y += 9;
                pdf.text(`Transaksi: ${rows.length} | Kantong: ${qty}`, 15, y);
                y += 7;
                pdf.setFillColor(14, 165, 233);
                pdf.rect(15, y, 70 * (revenue ? cash / revenue : 0), 5, 'F');
                pdf.setFillColor(34, 197, 94);
                pdf.rect(15 + 70 * (revenue ? cash / revenue : 0), y, 70 * (revenue ? invoice / revenue : 0), 5, 'F');
                y += 9;
                pdf.text(`Diagram CASH ${pct(cash, revenue)}% · INVOICE ${pct(invoice, revenue)}%`, 15, y);
                y += 7;
            }
            else if (report === 'warehouse') {
                pdf.text(`Stok saat ini: ${currentStock} kantong`, 15, y);
                y += 6;
                pdf.text(`Masuk: ${masuk} kantong`, 15, y);
                y += 6;
                pdf.text(`Keluar: ${keluar} kantong`, 15, y);
                y += 6;
                pdf.text(`Kembali diterima: ${kembali} kantong`, 15, y);
                y += 7;
                const wt = masuk + keluar + kembali || 1;
                pdf.setFillColor(34, 197, 94);
                pdf.rect(15, y, 70 * masuk / wt, 5, 'F');
                pdf.setFillColor(239, 68, 68);
                pdf.rect(15 + 70 * masuk / wt, y, 70 * keluar / wt, 5, 'F');
                pdf.setFillColor(139, 92, 246);
                pdf.rect(15 + 70 * (masuk + keluar) / wt, y, 70 * kembali / wt, 5, 'F');
                y += 7;
                pdf.text(`Diagram arus: Masuk ${pct(masuk, wt)}% · Keluar ${pct(keluar, wt)}% · Kembali ${pct(kembali, wt)}%`, 15, y);
                y += 9;
            }
            else {
                pdf.text(`Total driver aktif: ${driverStats.length}`, 15, y);
                y += 7;
                driverStats.slice(0, 10).forEach((d, i) => { const w = 60 * (maxDriver ? d.value / maxDriver : 0); pdf.setFillColor(14, 165, 233); pdf.rect(15, y, w, 4, 'F'); pdf.setFontSize(7); pdf.setTextColor(30, 41, 59); pdf.text(`${d.u.name} ${pct(d.value, revenue)}%`, 78, y + 3); y += 6; });
                pdf.setTextColor(0, 0, 0);
                y += 4;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text('RINGKASAN', 15, y);
            y += 6;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            if (report === 'driver') {
                driverStats.slice(0, 22).forEach((d, i) => {
                    pdf.text(`${i + 1}. ${d.u.name} | ${d.count} trx | ${d.qty} kantong | ${money(d.value)} | ${pct(d.value, revenue)}%`, 15, y);
                    y += 5;
                    if (y > 282) {
                        pdf.addPage();
                        y = 18;
                    }
                });
            }
            else if (report === 'warehouse') {
                warehouse.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 32).forEach((x, i) => {
                    pdf.text(`${i + 1}. ${new Date(x.timestamp).toLocaleDateString('id-ID')} | ${x.type.toUpperCase()} | ${x.qty} | ${x.byName || x.driverName || '-'}`, 15, y);
                    y += 5;
                    if (y > 282) {
                        pdf.addPage();
                        y = 18;
                    }
                });
            }
            else {
                rows.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 30).forEach((d, i) => {
                    pdf.text(`${i + 1}. ${new Date(d.timestamp).toLocaleDateString('id-ID')} | ${d.driverName} | ${d.customerName} | ${d.qty} | ${money(d.total)}`, 15, y);
                    y += 5;
                    if (y > 282) {
                        pdf.addPage();
                        y = 18;
                    }
                });
            }
            pdf.save(`glasires-${report}-${period}.pdf`);
        }
        catch (e) {
            show('PDF gagal: ' + e.message, 'err');
        }
    };
    const sendReport = async () => {
        if (!selectedUsers.length)
            return show('Pilih minimal satu user penerima.', 'err');
        const title = report === 'revenue' ? 'Laporan Pendapatan' : report === 'warehouse' ? 'Laporan Gudang' : 'Laporan Kinerja Driver';
        const message = report === 'revenue'
            ? `${title} ${periodLabel}: ${money(revenue)} | CASH ${money(cash)} | INVOICE ${money(invoice)} | LUNAS ${money(paid)} | WAIT CASH ${money(waitCash)} | WAIT CASH BELUM ${money(Math.max(0, waitCash - waitCashPaid))} | BELUM ${money(unpaid)}.`
            : report === 'warehouse'
                ? `${title} ${periodLabel}: Stok ${currentStock} kantong | Masuk ${masuk} | Keluar ${keluar} | Kembali ${kembali}.`
                : `${title} ${periodLabel}: ${driverStats.length} driver | ${qty} kantong | ${money(revenue)}.`;
        for (const uid of selectedUsers) {
            await notify({ title, message, type: 'report', toUser: uid, fromUser: me.id, data: {
                    report, period, periodStart: range.start, periodEnd: range.end,
                    revenue, cash, invoice, paid, unpaid, qty, masuk, keluar, kembali, currentStock,
                    driverCount: driverStats.length
                }, menu: 'reports' });
        }
        show(`Laporan berhasil dikirim ke ${selectedUsers.length} user.`);
    };
    const toggleUser = id => setSelectedUsers(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
    const doughnut = (a, b, c) => {
        const total = (+a || 0) + (+b || 0) + (+c || 0) || 1, pa = (+a || 0) / total * 100, pb = ((+a || 0) + (+b || 0)) / total * 100;
        return { background: `conic-gradient(#0ea5e9 0 ${pa}%, #22c55e ${pa}% ${pb}%, #f59e0b ${pb}% 100%)` };
    };
    return React.createElement("div", { className: "fade-in" },
        toast,
        React.createElement("div", { className: "no-print" },
            React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-5" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "font-display font-bold text-2xl" }, "\uD83D\uDCCA Super Admin Analytics"),
                    React.createElement("p", { className: "text-sm text-slate-500" }, "Pendapatan, gudang, stok dan kinerja seluruh driver.")),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(Btn, { tone: "accent", onClick: print }, "\uD83D\uDDA8 Print / PDF"),
                    React.createElement(Btn, { tone: "ghost", onClick: exportPdf }, "\uD83D\uDCC4 Export PDF"))),
            React.createElement(Card, { className: "mb-5" },
                React.createElement("div", { className: "grid lg:grid-cols-5 md:grid-cols-3 gap-3" },
                    React.createElement(Field, { label: "Jenis Laporan" },
                        React.createElement("select", { className: inputCls, value: report, onChange: e => setReport(e.target.value) },
                            React.createElement("option", { value: "revenue" }, "\uD83D\uDCB0 Pendapatan"),
                            React.createElement("option", { value: "warehouse" }, "\uD83D\uDCE6 Gudang & Stok"),
                            React.createElement("option", { value: "driver" }, "\uD83D\uDE9A Kinerja Driver"))),
                    React.createElement(Field, { label: "Periode" },
                        React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                            React.createElement("option", { value: "day" }, "Harian"),
                            React.createElement("option", { value: "month" }, "Bulanan"),
                            React.createElement("option", { value: "year" }, "Tahunan"))),
                    React.createElement(Field, { label: "Tanggal Acuan" },
                        React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) })),
                    React.createElement(Field, { label: "Driver" },
                        React.createElement("select", { className: inputCls, value: driverId, onChange: e => setDriverId(e.target.value) },
                            React.createElement("option", { value: "" }, "Semua Driver"),
                            drivers.map(u => React.createElement("option", { key: u.id, value: u.id }, u.name)))),
                    React.createElement("div", { className: "flex items-end" },
                        React.createElement("div", { className: "w-full rounded-xl bg-slate-50 border p-3 text-xs" },
                            React.createElement("b", null, "Periode aktif"),
                            React.createElement("div", null,
                                range.a.toLocaleDateString('id-ID'),
                                " \u2014 ",
                                range.b.toLocaleDateString('id-ID'))))))),
        React.createElement("div", { className: "report-page report-print-area super-admin-report-print-area", style: { '--report-color': cfg.reportColor || '#1c4a73' } },
            React.createElement("div", { className: "report-head" },
                cfg.logo && React.createElement("img", { className: "report-logo", src: cfg.logo }),
                React.createElement("div", null,
                    React.createElement("div", { className: "report-title text-2xl font-bold" }, cfg.name || 'GlasirEs'),
                    React.createElement("div", { className: "text-sm" }, cfg.address || 'Alamat perusahaan belum diatur'),
                    React.createElement("div", { className: "text-sm" }, cfg.phone || ''))),
            React.createElement("div", { className: "mt-6 flex flex-wrap justify-between gap-3" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-2xl font-display font-bold" }, report === 'revenue' ? 'LAPORAN PENDAPATAN' : report === 'warehouse' ? 'LAPORAN GUDANG & STOK' : 'LAPORAN KINERJA DRIVER'),
                    React.createElement("p", { className: "text-sm" },
                        "Periode ",
                        periodLabel,
                        ": ",
                        range.a.toLocaleDateString('id-ID'),
                        " s/d ",
                        range.b.toLocaleDateString('id-ID'))),
                React.createElement("div", { className: "text-right text-xs text-slate-500" },
                    "Dibuat oleh",
                    React.createElement("br", null),
                    React.createElement("b", null, me.name),
                    " \u00B7 Super Admin")),
            React.createElement(InvoiceCustomerAnalytics, { startTs: range.start, endTs: range.end }),
            report === 'revenue' && React.createElement("div", null,
                React.createElement("div", { className: "grid md:grid-cols-4 gap-3 my-5" },
                    React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border border-sky-100" },
                        React.createElement("small", null, "PENDAPATAN"),
                        React.createElement("b", { className: "block text-xl text-sky-700" }, money(revenue)),
                        React.createElement("span", { className: "text-xs" },
                            rows.length,
                            " transaksi \u00B7 ",
                            qty,
                            " kantong")),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border border-emerald-100" },
                        React.createElement("small", null, "CASH"),
                        React.createElement("b", { className: "block text-xl text-emerald-700" }, money(cash)),
                        React.createElement("span", { className: "text-xs" },
                            pct(cash, revenue),
                            "% dari pendapatan")),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-violet-50 border border-violet-100" },
                        React.createElement("small", null, "INVOICE"),
                        React.createElement("b", { className: "block text-xl text-violet-700" }, money(invoice)),
                        React.createElement("span", { className: "text-xs" },
                            pct(invoice, revenue),
                            "% dari pendapatan")),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-amber-50 border border-amber-100" },
                        React.createElement("small", null, "WAIT CASH"),
                        React.createElement("b", { className: "block text-xl text-amber-700" }, money(waitCash)),
                        React.createElement("span", { className: "text-xs" },
                            "Belum lunas ",
                            money(Math.max(0, waitCash - waitCashPaid)))),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-amber-50 border border-amber-100" },
                        React.createElement("small", null, "BELUM LUNAS"),
                        React.createElement("b", { className: "block text-xl text-amber-700" }, money(unpaid)),
                        React.createElement("span", { className: "text-xs" },
                            pct(unpaid, invoice),
                            "% dari invoice"))),
                React.createElement("div", { className: "grid md:grid-cols-2 gap-5" },
                    React.createElement(Card, null,
                        React.createElement("h3", { className: "font-bold mb-4" }, "Diagram Pendapatan"),
                        React.createElement("div", { className: "flex items-center gap-6" },
                            React.createElement("div", { className: "w-40 h-40 rounded-full relative", style: doughnut(cash, invoice, waitCash) },
                                React.createElement("div", { className: "absolute inset-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-center" },
                                    "TOTAL",
                                    React.createElement("br", null),
                                    money(revenue))),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", null,
                                    React.createElement("span", { className: "inline-block w-3 h-3 rounded-full bg-sky-500 mr-2" }),
                                    "CASH ",
                                    React.createElement("b", null,
                                        pct(cash, revenue),
                                        "%"),
                                    React.createElement("br", null),
                                    React.createElement("span", { className: "ml-5" }, money(cash))),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "inline-block w-3 h-3 rounded-full bg-green-500 mr-2" }),
                                    "INVOICE ",
                                    React.createElement("b", null,
                                        pct(invoice, revenue),
                                        "%"),
                                    React.createElement("br", null),
                                    React.createElement("span", { className: "ml-5" }, money(invoice))),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "inline-block w-3 h-3 rounded-full bg-amber-500 mr-2" }),
                                    "WAIT CASH ",
                                    React.createElement("b", null,
                                        pct(waitCash, revenue),
                                        "%"),
                                    React.createElement("br", null),
                                    React.createElement("span", { className: "ml-5" }, money(waitCash)))))),
                    React.createElement(Card, null,
                        React.createElement("h3", { className: "font-bold mb-4" }, "Status Invoice"),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("div", { className: "flex justify-between text-sm" },
                                    React.createElement("span", null, "Lunas"),
                                    React.createElement("b", null,
                                        money(paid),
                                        " \u00B7 ",
                                        pct(paid, invoice),
                                        "%")),
                                React.createElement("div", { className: "h-3 bg-slate-100 rounded-full overflow-hidden" },
                                    React.createElement("div", { className: "h-full bg-emerald-500", style: { width: `${pct(paid, invoice)}%` } }))),
                            React.createElement("div", null,
                                React.createElement("div", { className: "flex justify-between text-sm" },
                                    React.createElement("span", null, "Belum Lunas"),
                                    React.createElement("b", null,
                                        money(unpaid),
                                        " \u00B7 ",
                                        pct(unpaid, invoice),
                                        "%")),
                                React.createElement("div", { className: "h-3 bg-slate-100 rounded-full overflow-hidden" },
                                    React.createElement("div", { className: "h-full bg-amber-500", style: { width: `${pct(unpaid, invoice)}%` } }))))))),
            report === 'warehouse' && React.createElement("div", null,
                React.createElement("div", { className: "grid md:grid-cols-4 gap-3 my-5" },
                    React.createElement("div", { className: "p-4 rounded-2xl bg-cyan-50 border" },
                        React.createElement("small", null, "STOK SAAT INI"),
                        React.createElement("b", { className: "block text-2xl text-cyan-700" }, currentStock),
                        React.createElement("span", { className: "text-xs" }, "kantong")),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                        React.createElement("small", null, "GUDANG MASUK"),
                        React.createElement("b", { className: "block text-2xl text-emerald-700" }, masuk),
                        React.createElement("span", { className: "text-xs" },
                            "kantong \u00B7 ",
                            pct(masuk, masuk + keluar),
                            "%")),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-rose-50 border" },
                        React.createElement("small", null, "GUDANG KELUAR"),
                        React.createElement("b", { className: "block text-2xl text-rose-700" }, keluar),
                        React.createElement("span", { className: "text-xs" },
                            "kantong \u00B7 ",
                            pct(keluar, masuk + keluar),
                            "%")),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-violet-50 border" },
                        React.createElement("small", null, "KEMBALI DITERIMA"),
                        React.createElement("b", { className: "block text-2xl text-violet-700" }, kembali),
                        React.createElement("span", { className: "text-xs" }, "kantong"))),
                React.createElement("div", { className: "grid md:grid-cols-2 gap-5" },
                    React.createElement(Card, null,
                        React.createElement("h3", { className: "font-bold mb-4" }, "Diagram Arus Gudang"),
                        React.createElement("div", { className: "flex items-center gap-6" },
                            React.createElement("div", { className: "w-40 h-40 rounded-full", style: doughnut(masuk, keluar) }),
                            React.createElement("div", { className: "text-sm space-y-2" },
                                React.createElement("div", null,
                                    "\uD83D\uDFE2 Masuk: ",
                                    React.createElement("b", null, masuk),
                                    " (",
                                    pct(masuk, masuk + keluar),
                                    "%)"),
                                React.createElement("div", null,
                                    "\uD83D\uDD35 Keluar: ",
                                    React.createElement("b", null, keluar),
                                    " (",
                                    pct(keluar, masuk + keluar),
                                    "%)"),
                                React.createElement("div", null,
                                    "\uD83D\uDFE3 Kembali: ",
                                    React.createElement("b", null, kembali))))),
                    React.createElement(Card, null,
                        React.createElement("h3", { className: "font-bold mb-4" }, "Aktivitas Gudang"),
                        React.createElement("div", { className: "space-y-3" },
                            warehouse.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 12).map(x => React.createElement("div", { key: x.id, className: "flex justify-between border-b pb-2 text-sm" },
                                React.createElement("span", null,
                                    x.type === 'masuk' ? '🟢' : '🔴',
                                    " ",
                                    x.type.toUpperCase(),
                                    React.createElement("br", null),
                                    React.createElement("small", null, x.byName || x.driverName || '-')),
                                React.createElement("b", null,
                                    x.qty,
                                    " kantong"))),
                            !warehouse.length && React.createElement("div", { className: "text-slate-400" }, "Belum ada aktivitas periode ini.")))),
                React.createElement(WarehouseProductBreakdown, { startTs: range.start, endTs: range.end, includeAll: true })),
            report === 'driver' && React.createElement("div", null,
                React.createElement("div", { className: "grid md:grid-cols-4 gap-3 my-5" },
                    React.createElement("div", { className: "p-4 rounded-2xl bg-sky-50 border" },
                        React.createElement("small", null, "DRIVER AKTIF"),
                        React.createElement("b", { className: "block text-2xl text-sky-700" }, driverStats.length)),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-cyan-50 border" },
                        React.createElement("small", null, "TOTAL KANTONG"),
                        React.createElement("b", { className: "block text-2xl text-cyan-700" }, qty)),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-50 border" },
                        React.createElement("small", null, "NILAI PENJUALAN"),
                        React.createElement("b", { className: "block text-xl text-emerald-700" }, money(revenue))),
                    React.createElement("div", { className: "p-4 rounded-2xl bg-violet-50 border" },
                        React.createElement("small", null, "RATA-RATA / DRIVER"),
                        React.createElement("b", { className: "block text-xl text-violet-700" }, money(driverStats.length ? revenue / driverStats.length : 0)))),
                React.createElement(Card, { className: "mb-5" },
                    React.createElement("h3", { className: "font-bold mb-4" }, "Diagram Batang Kinerja Driver"),
                    React.createElement("div", { className: "space-y-4" },
                        driverStats.map((d, i) => React.createElement("div", { key: d.u.id },
                            React.createElement("div", { className: "flex justify-between text-sm mb-1" },
                                React.createElement("span", null,
                                    React.createElement("b", null,
                                        i + 1,
                                        ". ",
                                        d.u.name),
                                    " \u00B7 ",
                                    d.count,
                                    " transaksi \u00B7 ",
                                    d.qty,
                                    " kantong"),
                                React.createElement("b", null,
                                    money(d.value),
                                    " \u00B7 ",
                                    pct(d.value, revenue),
                                    "%")),
                            React.createElement("div", { className: "h-5 bg-slate-100 rounded-full overflow-hidden" },
                                React.createElement("div", { className: "h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full", style: { width: `${Math.max(2, Math.round(d.value / maxDriver * 100))}%` } })))),
                        !driverStats.length && React.createElement("div", { className: "text-slate-400" }, "Belum ada data driver."))),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm border-separate border-spacing-0" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "bg-slate-100" },
                                React.createElement("th", { className: "p-3 text-left" }, "Driver"),
                                React.createElement("th", { className: "p-3" }, "Transaksi"),
                                React.createElement("th", { className: "p-3" }, "Kantong"),
                                React.createElement("th", { className: "p-3" }, "Nilai"),
                                React.createElement("th", { className: "p-3" }, "Kontribusi"),
                                React.createElement("th", { className: "p-3" }, "Tertagih"))),
                        React.createElement("tbody", null, driverStats.map(d => React.createElement("tr", { key: d.u.id, className: "border-b" },
                            React.createElement("td", { className: "p-3 font-semibold" }, d.u.name),
                            React.createElement("td", { className: "p-3 text-center" }, d.count),
                            React.createElement("td", { className: "p-3 text-center" }, d.qty),
                            React.createElement("td", { className: "p-3 text-right" }, money(d.value)),
                            React.createElement("td", { className: "p-3 text-center" },
                                pct(d.value, revenue),
                                "%"),
                            React.createElement("td", { className: "p-3 text-right" }, money(d.paid)))))))),
            React.createElement("div", { className: "mt-8 sig" },
                React.createElement("div", null,
                    "Mengetahui,",
                    React.createElement("div", { className: "sigline" }),
                    React.createElement("b", null, cfg.name || 'Perusahaan')),
                React.createElement("div", null,
                    "Dibuat oleh,",
                    React.createElement("div", { className: "sigline" }),
                    React.createElement("b", null, me.name),
                    React.createElement("div", { className: "text-xs" }, "Super Admin"))),
            React.createElement("div", { className: "text-center text-[10px] text-slate-400 mt-8" }, "Power by Syech B@-it \u00B7 Copyright \u00A9 2026")),
        React.createElement("div", { className: "no-print mt-6" },
            React.createElement(Card, null,
                React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-bold" }, "\uD83D\uDCE8 Kirim Laporan ke User"),
                        React.createElement("p", { className: "text-xs text-slate-500" }, "User penerima akan mendapat notifikasi berisi ringkasan laporan dan nilai uang.")),
                    React.createElement(Btn, { tone: "accent", onClick: sendReport },
                        "\uD83D\uDCE8 Kirim ke ",
                        selectedUsers.length || 0,
                        " User")),
                React.createElement("div", { className: "grid md:grid-cols-3 gap-2" }, us.filter(u => u.active !== false && u.id !== me.id).map(u => React.createElement("label", { key: u.id, className: `border rounded-xl p-3 cursor-pointer flex items-center gap-3 ${selectedUsers.includes(u.id) ? 'ring-2 ring-sky-400 bg-sky-50' : ''}` },
                    React.createElement("input", { type: "checkbox", checked: selectedUsers.includes(u.id), onChange: () => toggleUser(u.id) }),
                    React.createElement("span", null,
                        React.createElement("b", null, u.name),
                        React.createElement("small", { className: "block text-slate-500" }, ROLES[u.role]))))))));
}
