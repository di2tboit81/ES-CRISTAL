function Card({ children, className = '' }) { return React.createElement("div", { className: 'glass rounded-3xl shadow-2xl p-6 ' + className }, children); }
function Btn({ children, onClick, tone = 'primary', disabled = false, className = '', type = 'button' }) { const c = { primary: 'bg-glacier-900 text-white', accent: 'bg-frost-400 text-glacier-900', ghost: 'bg-white text-glacier-700 border border-slate-200', danger: 'bg-rose-600 text-white' }; return React.createElement("button", { type: type, disabled: disabled, onClick: onClick, className: 'px-4 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-40 ' + c[tone] + ' ' + className }, children); }
function Field({ label, children }) { return React.createElement("label", { className: "block mb-3" },
    React.createElement("span", { className: "block text-xs font-semibold text-glacier-600 mb-1.5" }, label),
    children); }
// DRIVER ONLY: preserve the complete text exactly as typed, including spaces between words.
const driverFullText = v => String(v !== null && v !== void 0 ? v : '').replace(/\s+/g, ' ').trim();
const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm';
function Pill({ children, tone = 'default' }) { const c = { default: 'bg-slate-100 text-slate-700', pending: 'bg-amber-100 text-amber-700', approved: 'bg-sky-100 text-sky-700', done: 'bg-emerald-100 text-emerald-700', rejected: 'bg-rose-100 text-rose-700' }; return React.createElement("span", { className: 'px-2.5 py-1 rounded-full text-xs font-semibold ' + c[tone] }, children); }
function useToast() { const [t, setT] = useState(null); const show = (msg, tone = 'ok') => { setT({ msg, tone }); setTimeout(() => setT(null), 3000); }; return [t && React.createElement("div", { className: 'fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm text-white ' + (t.tone === 'err' ? 'bg-rose-600' : 'bg-glacier-900') }, t.msg), show]; }
function IceGauge({ label, value, max, big }) { const p = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0)); return React.createElement("div", { className: "flex items-end gap-4" },
    React.createElement("div", { className: "icebar-shell", style: { width: big ? 54 : 38, height: big ? 140 : 96 } },
        React.createElement("div", { className: "icebar-fill w-full", style: { height: p + '%' } })),
    React.createElement("div", null,
        React.createElement("div", { className: 'font-display font-bold text-glacier-900 ' + (big ? 'text-3xl' : 'text-xl') }, Math.round(value || 0).toLocaleString('id-ID')),
        React.createElement("div", { className: "text-xs text-slate-500" }, "kantong"),
        React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, label))); }
function SetupScreen({ onDone }) { const [n, setN] = useState(''), [u, setU] = useState(''), [p, setP] = useState(''), [e, setE] = useState(''), [busy, setBusy] = useState(false); const go = async () => { if (!n || !u || !p)
    return setE('Semua kolom wajib diisi.'); setBusy(true); try {
    const r = db.ref('users').push();
    await r.set({ name: n, username: u.trim(), passwordHash: await sha256(p), role: 'superadmin', active: true, createdAt: Date.now() });
    await db.ref('config/pricePerBag').set(15000);
    await db.ref('warehouse/stock').set(0);
    await db.ref('config/company').set({ name: 'GlasirEs', address: '', phone: '', logo: '', reportColor: '#1c4a73' });
    onDone();
}
catch (x) {
    setE(x.message);
} setBusy(false); }; return React.createElement("div", { className: "min-h-screen flex items-center justify-center p-6" },
    React.createElement(Card, { className: "w-full max-w-md" },
        React.createElement("h1", { className: "font-display text-2xl font-bold mb-2" }, "Setup Super Admin"),
        React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Buat akun pertama GlasirEs."),
        React.createElement(Field, { label: "Nama" },
            React.createElement("input", { className: inputCls, value: n, onChange: e => setN(e.target.value) })),
        React.createElement(Field, { label: "Username" },
            React.createElement("input", { className: inputCls, value: u, onChange: e => setU(e.target.value) })),
        React.createElement(Field, { label: "Password" },
            React.createElement("input", { type: "password", className: inputCls, value: p, onChange: e => setP(e.target.value) })),
        e && React.createElement("p", { className: "text-rose-600 text-sm mb-3" }, e),
        React.createElement(Btn, { tone: "accent", className: "w-full", onClick: go, disabled: busy }, busy ? 'Menyimpan…' : 'Buat Super Admin'))); }
function LoginScreen({ onLogin }) { const [u, setU] = useState(''), [p, setP] = useState(''), [e, setE] = useState(''), [busy, setB] = useState(false); const go = async () => { setB(true); setE(''); try {
    const s = await db.ref('users').once('value'), a = toList(s.val()), loginUsername = u.trim().toLowerCase(), x = a.find(z => String(z.username || '').trim().toLowerCase() === loginUsername);
    if (!x || x.active === false)
        throw Error('Username tidak ditemukan atau nonaktif.');
    if (await sha256(p) !== x.passwordHash)
        throw Error('Password salah.');
    localStorage.setItem('glasires_uid', x.id);
    onLogin({ id: x.id, ...x });
}
catch (z) {
    setE(z.message);
} setB(false); }; return React.createElement("div", { className: "min-h-screen flex items-center justify-center p-6" },
    React.createElement("div", { className: "w-full max-w-md" },
        React.createElement("div", { className: "text-center mb-7" },
            React.createElement("div", { className: "font-display font-extrabold text-3xl" }, "GlasirEs"),
            React.createElement("p", { className: "text-sm text-slate-500" }, "Sistem distribusi & stok es kristal")),
        React.createElement(Card, null,
            React.createElement(Field, { label: "Username" },
                React.createElement("input", { className: inputCls, value: u, onChange: e => setU(e.target.value), onKeyDown: e => e.key === 'Enter' && go() })),
            React.createElement(Field, { label: "Password" },
                React.createElement("input", { type: "password", className: inputCls, value: p, onChange: e => setP(e.target.value), onKeyDown: e => e.key === 'Enter' && go() })),
            e && React.createElement("p", { className: "text-rose-600 text-sm mb-3" }, e),
            React.createElement(Btn, { tone: "accent", className: "w-full", onClick: go, disabled: busy }, busy ? 'Memeriksa…' : 'Masuk'))),
    React.createElement("div", { className: "login-copyright" },
        "Copyright \u00A9 2026 | Power by ",
        React.createElement("span", { className: "bait-brand" }, "Syech B@-it"))); }
function BellIcon({ ringing }) {
    return React.createElement("svg", { viewBox: "0 0 24 24", width: "22", height: "22", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-glacier-800 " + (ringing ? 'notif-bell-shake' : '') },
        React.createElement("path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" }),
        React.createElement("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" }));
}
function NotificationPanel({ user, onClose }) {
    const ns = useNotifications(user), unreadCount = ns.filter(n => !n.read).length;
    return React.createElement("div", { className: "absolute right-0 top-14 w-[min(390px,calc(100vw-30px))] max-h-[520px] overflow-hidden rounded-2xl shadow-2xl bg-white border z-[90]" },
        React.createElement("div", { className: "flex justify-between items-center p-4 border-b font-bold" },
            React.createElement("span", null, "\uD83D\uDD14 Notifikasi"),
            React.createElement("button", { onClick: onClose }, "\u2715")),
        unreadCount > 0 && React.createElement("div", { className: "flex justify-between items-center px-4 py-2 border-b bg-slate-50" },
            React.createElement("span", { className: "text-xs text-slate-500" },
                unreadCount,
                " belum dibaca"),
            React.createElement("button", { onClick: () => markAllRead(ns), className: "text-xs font-bold text-sky-600 hover:text-sky-800" }, "\u2713 Tandai semua sudah dibaca")),
        React.createElement("div", { className: "overflow-y-auto max-h-[460px]" }, ns.length ? ns.map(n => React.createElement("div", { key: n.id, onClick: () => markRead(n.id), className: 'p-4 border-b cursor-pointer ' + (!n.read ? 'bg-blue-50' : '') },
            React.createElement("div", { className: "font-semibold" }, n.title),
            React.createElement("div", { className: "text-sm mt-1" }, n.message),
            React.createElement("div", { className: "text-xs text-slate-400 mt-2" }, waktu(n.createdAt)))) : React.createElement("div", { className: "p-8 text-center text-slate-400" }, "Tidak ada notifikasi")));
}
function Shell({ user, tabs, active, setActive, onLogout, children }) { const [mo, setMo] = useState(false), [sn, setSn] = useState(false); useEffect(() => { const up = e => { const t = e.target; if (t && t.classList && (t.classList.contains('driver-full-input') || t.classList.contains('user-manage-input')))
    return; if (t && ((t.tagName === 'INPUT' && t.type !== 'password' && t.type !== 'date' && t.type !== 'number') || t.tagName === 'TEXTAREA')) {
    const v = t.value.toUpperCase();
    if (t.value !== v)
        t.value = v;
} }; document.addEventListener('input', up, true); return () => document.removeEventListener('input', up, true); }, []); const ns = useNotifications(user); useNewNotificationSound(ns); const unread = ns.filter(n => !n.read).length; const menuBadges = useMemo(() => { const m = {}; ns.forEach(n => { if (!n.read && n.menu)
    m[n.menu] = (m[n.menu] || 0) + 1; }); return m; }, [ns]); const openMenu = key => { setActive(key); setMo(false); const items = ns.filter(n => n.menu === key && !n.read); if (items.length)
    markAllRead(items); }; return React.createElement("div", { className: "app-auth min-h-screen flex" },
    React.createElement("aside", { className: 'print-hide fixed lg:static z-40 inset-y-0 left-0 w-64 bg-glacier-900 text-frost-200 flex flex-col transition-transform ' + (mo ? 'translate-x-0' : '-translate-x-full lg:translate-x-0') },
        React.createElement("div", { className: "px-5 py-5 border-b border-white/10" },
            React.createElement("span", { className: "font-display font-extrabold text-xl text-white" }, "GlasirEs")),
        React.createElement("nav", { className: "flex-1 p-3 space-y-1 overflow-y-auto" }, tabs.map(t => React.createElement("button", { key: t.key, onClick: () => openMenu(t.key), className: 'w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl text-sm font-medium ' + (active === t.key ? 'bg-frost-400 text-glacier-900' : 'text-frost-200/80 hover:bg-white/5') },
            React.createElement("span", null,
                t.icon,
                " ",
                t.label),
            menuBadges[t.key] > 0 && React.createElement("span", { className: "notif-badge-pulse bg-red-600 text-white rounded-full text-[10px] font-bold min-w-[19px] h-[19px] px-1 flex items-center justify-center flex-none" }, menuBadges[t.key] > 99 ? '99+' : menuBadges[t.key])))),
        React.createElement("div", { className: "p-4 border-t border-white/10" },
            React.createElement("div", { className: "text-xs text-frost-200/60" }, "Masuk sebagai"),
            React.createElement("div", { className: "font-semibold text-white" }, user.name),
            React.createElement("span", { className: 'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ' + BADGE[user.role] }, ROLES[user.role]),
            React.createElement(Btn, { tone: "ghost", className: "w-full mt-3 !bg-white/5 !text-white !border-white/15", onClick: onLogout }, "Keluar")),
        React.createElement("footer", { className: "bait-developer-footer" },
            React.createElement("div", { className: "bait-developer-content" },
                React.createElement("div", { className: "bait-powered" }, "\u25CF Power by"),
                React.createElement("div", { className: "bait-name" }, "Syech B@-it"),
                React.createElement("div", { className: "bait-copyright" }, "Copyright \u00A9 2026")))),
    mo && React.createElement("div", { className: "fixed inset-0 bg-black/40 z-30 lg:hidden", onClick: () => setMo(false) }),
    React.createElement("main", { className: "flex-1 min-w-0" },
        React.createElement("div", { className: "print-hide lg:hidden sticky top-0 z-20 glass flex justify-between p-3" },
            React.createElement("button", { onClick: () => setMo(true) }, "\u2630"),
            React.createElement("b", null, "GlasirEs"),
            React.createElement("span", null)),
        React.createElement("div", { className: "p-5 lg:p-8 max-w-7xl mx-auto" },
            React.createElement("div", { className: "print-hide flex justify-end mb-4 relative" },
                React.createElement("div", { className: "relative inline-block" },
                    React.createElement("button", { onClick: () => setSn(!sn), className: "notif-bell-btn bg-white border rounded-full w-11 h-11 shadow flex items-center justify-center" },
                        React.createElement(BellIcon, { ringing: unread > 0 })),
                    unread > 0 && React.createElement("span", { className: "notif-badge-pulse absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full text-[10px] font-bold min-w-[20px] h-[20px] px-1 flex items-center justify-center pointer-events-none" }, unread > 99 ? '99+' : unread)),
                sn && React.createElement(NotificationPanel, { user: user, onClose: () => setSn(false) })),
            children))); }
