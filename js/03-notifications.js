async function notify({ title, message, type = 'info', toRole = null, toUser = null, fromUser = null, data = {}, menu = null }) {
    try {
        await db.ref('notifications').push({ title, message, type, toRole, toUser, fromUser, data, menu, read: false, createdAt: Date.now() });
    }
    catch (e) {
        console.error(e);
    }
}
function useNotifications(user) {
    const all = useDbList('notifications');
    return useMemo(() => toList(all).filter(n => (n.toUser && n.toUser === user.id) || (n.toRole && n.toRole === user.role) || (!n.toUser && !n.toRole)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), [all, user.id, user.role]);
}
async function markRead(id) { await db.ref('notifications/' + id + '/read').set(true); }
async function markAllRead(list) {
    try {
        const updates = {};
        (list || []).forEach(n => { if (!n.read)
            updates[n.id + '/read'] = true; });
        if (Object.keys(updates).length)
            await db.ref('notifications').update(updates);
    }
    catch (e) {
        console.error(e);
    }
}
function playBell() {
    try {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A)
            return;
        const c = new A(), now = c.currentTime;
        [880, 1108.73, 1318.51].forEach((freq, i) => {
            const t = now + i * 0.09, o = c.createOscillator(), g = c.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(.0001, t);
            g.gain.exponentialRampToValueAtTime(.42, t + .02);
            g.gain.exponentialRampToValueAtTime(.0001, t + .55);
            o.connect(g);
            g.connect(c.destination);
            o.start(t);
            o.stop(t + .6);
        });
        const o2 = c.createOscillator(), g2 = c.createGain();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(440, now);
        g2.gain.setValueAtTime(.0001, now);
        g2.gain.exponentialRampToValueAtTime(.32, now + .02);
        g2.gain.exponentialRampToValueAtTime(.0001, now + .4);
        o2.connect(g2);
        g2.connect(c.destination);
        o2.start(now);
        o2.stop(now + .45);
    }
    catch (e) { }
}
function useNewNotificationSound(list) {
    const [ready, setReady] = useState(false);
    useEffect(() => { const f = () => setReady(true); window.addEventListener('click', f, { once: true }); return () => window.removeEventListener('click', f); }, []);
    useEffect(() => { if (!list.length)
        return; const newest = list[0]; const k = 'glasires_last_notification'; const old = localStorage.getItem(k); if (old && old !== newest.id && ready)
        playBell(); localStorage.setItem(k, newest.id); }, [list, ready]);
}
function createAudit(type, detail, user) { return db.ref('logs').push({ type, detail, by: (user === null || user === void 0 ? void 0 : user.id) || '', byName: (user === null || user === void 0 ? void 0 : user.name) || '', byRole: (user === null || user === void 0 ? void 0 : user.role) || '', timestamp: Date.now() }); }
