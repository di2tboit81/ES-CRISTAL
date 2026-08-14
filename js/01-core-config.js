const { useState, useEffect, useMemo } = React;
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD8LEwi8fIqOkkLJ-6LSehMbWkDDdN8tR8",
    authDomain: "ice-cristal.firebaseapp.com",
    databaseURL: "https://ice-cristal-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ice-cristal",
    storageBucket: "ice-cristal.firebasestorage.app",
    messagingSenderId: "478336549607",
    appId: "1:478336549607:web:136e276d0babd09f35d842"
};
let db = null, FIREBASE_INIT_ERROR = null;
try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
}
catch (e) {
    FIREBASE_INIT_ERROR = e.message;
}
async function sha256(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const rupiah = n => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
const waktu = t => t ? new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
const tanggalLokal = t => { const d = t ? new Date(t) : new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const toList = o => Object.entries(o || {}).map(([id, v]) => ({ id, ...v }));
function useDbList(path) { const [d, setD] = useState({}); useEffect(() => { if (!db)
    return; const r = db.ref(path), cb = s => setD(s.val() || {}); r.on('value', cb); return () => r.off('value', cb); }, [path]); return d; }
function useDbValue(path, fb) { const [d, setD] = useState(fb); useEffect(() => { if (!db)
    return; const r = db.ref(path), cb = s => setD(s.val() === null ? fb : s.val()); r.on('value', cb); return () => r.off('value', cb); }, [path]); return d; }
const ROLES = { bigsuperadmin: 'BIG SUPER ADMIN', superadmin: 'Super Admin', admin: 'Admin', driver: 'Driver', gudang: 'Gudang' };
const BADGE = { bigsupperadmin: 'bg-fuchsia-100 text-fuchsia-800', bigsuperadmin: 'bg-fuchsia-100 text-fuchsia-800', superadmin: 'bg-white/20 text-white', admin: 'bg-blue-100 text-blue-800', driver: 'bg-cyan-100 text-cyan-800', gudang: 'bg-teal-100 text-teal-800' };
const BIG_DEFAULT_USERNAME = 'bigsuperadmin';
const BIG_DEFAULT_PASSWORD = 'BigSuperAdmin@2026';
const BIG_DEFAULT_NAME = 'BIG SUPER ADMIN';
async function ensureBigSuperAdmin() {
    if (!db)
        return;
    const snap = await db.ref('users').once('value');
    const users = toList(snap.val());
    const found = users.find(u => u.role === 'bigsuperadmin');
    if (found)
        return found;
    const ref = db.ref('users').push();
    const user = {
        name: BIG_DEFAULT_NAME,
        username: BIG_DEFAULT_USERNAME,
        passwordHash: await sha256(BIG_DEFAULT_PASSWORD),
        role: 'bigsuperadmin',
        active: true,
        protected: true,
        createdAt: Date.now()
    };
    await ref.set(user);
    return { id: ref.key, ...user };
}
function DateReportFilter({ period, setPeriod, date, setDate }) { return React.createElement(Card, { className: "mb-5" },
    React.createElement("div", { className: "grid md:grid-cols-3 gap-3" },
        React.createElement(Field, { label: "Periode" },
            React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                React.createElement("option", { value: "day" }, "HARIAN"),
                React.createElement("option", { value: "month" }, "BULANAN"),
                React.createElement("option", { value: "year" }, "TAHUNAN"))),
        React.createElement(Field, { label: "Tanggal Acuan" },
            React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) })),
        React.createElement("div", { className: "flex items-end" },
            React.createElement(Btn, { tone: "accent", onClick: () => window.print() }, "\uD83D\uDDA8 PRINT / PDF")))); }
function DateRange({ period, setPeriod, date, setDate }) { return React.createElement(Card, { className: "mb-5" },
    React.createElement("div", { className: "grid md:grid-cols-3 gap-3" },
        React.createElement(Field, { label: "Periode" },
            React.createElement("select", { className: inputCls, value: period, onChange: e => setPeriod(e.target.value) },
                React.createElement("option", { value: "day" }, "HARIAN"),
                React.createElement("option", { value: "month" }, "BULANAN"),
                React.createElement("option", { value: "year" }, "TAHUNAN"))),
        React.createElement(Field, { label: "Tanggal Acuan" },
            React.createElement("input", { type: "date", className: inputCls, value: date, onChange: e => setDate(e.target.value) })),
        React.createElement("div", { className: "flex items-end" },
            React.createElement(Btn, { tone: "accent", onClick: () => window.print() }, "\uD83D\uDDA8 PRINT / PDF")))); }
function periodRange(period, date) { const b = new Date((date || tanggalLokal()) + 'T00:00:00'); let a, e; if (period === 'day') {
    a = new Date(b);
    a.setHours(0, 0, 0, 0);
    e = new Date(b);
    e.setHours(23, 59, 59, 999);
}
else if (period === 'month') {
    a = new Date(b.getFullYear(), b.getMonth(), 1);
    e = new Date(b.getFullYear(), b.getMonth() + 1, 0, 23, 59, 59, 999);
}
else {
    a = new Date(b.getFullYear(), 0, 1);
    e = new Date(b.getFullYear(), 11, 31, 23, 59, 59, 999);
} return { start: a.getTime(), end: e.getTime(), a, e }; }
