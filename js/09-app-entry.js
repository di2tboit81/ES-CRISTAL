function App() { const [loading, setLoading] = useState(true), [has, setHas] = useState(true), [me, setMe] = useState(null); useEffect(() => { (async () => { try {
    const s = await db.ref('users').once('value');
    setHas(s.exists());
    if (s.exists())
        await ensureBigSuperAdmin();
    const id = localStorage.getItem('glasires_uid');
    if (s.exists() && id) {
        const u = await db.ref('users/' + id).once('value');
        if (u.exists() && u.val().active !== false)
            setMe({ id, ...u.val() });
        else
            localStorage.removeItem('glasires_uid');
    }
}
catch (e) {
    console.error(e);
} setLoading(false); })(); }, []); if (loading)
    return React.createElement("div", { className: "min-h-screen flex items-center justify-center font-mono text-slate-400" }, "Memuat GlasirEs\u2026"); if (!has)
    return React.createElement(SetupScreen, { onDone: () => location.reload() }); if (!me)
    return React.createElement(LoginScreen, { onLogin: setMe }); if (me.role === 'bigsuperadmin')
    return React.createElement(BigSuperAdmin, { me: me }); if (me.role === 'superadmin')
    return React.createElement(AdminApp, { me: me, isSuper: true }); if (me.role === 'admin')
    return React.createElement(AdminApp, { me: me }); if (me.role === 'driver')
    return React.createElement(DriverApp, { me: me }); if (me.role === 'gudang')
    return React.createElement(GudangApp, { me: me }); return React.createElement("div", { className: "p-8" }, "Peran tidak dikenal."); }
ReactDOM.createRoot(document.getElementById('root')).render(FIREBASE_INIT_ERROR ? React.createElement("div", { className: "p-8 text-rose-600" },
    "Firebase error: ",
    FIREBASE_INIT_ERROR) : React.createElement(App, null));
// Anti-inspect ringan; tidak mengganggu aplikasi.
document.addEventListener('contextmenu', e => e.preventDefault());
