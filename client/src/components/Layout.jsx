import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const navigationItems = [
    { label: '概览', path: '/dashboard' },
    { label: '文件管理', path: '/files' },
    { label: '用户', path: '/user' },
    { label: '游戏', path: '/game' },
    { label: '详情', path: '/details' },
];

function Layout({ session, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const welcomeName = useMemo(
        () => session?.user?.displayName || session?.user?.username || '管理员',
        [session],
    );

    const handleLogout = () => {
        onLogout();
        navigate('/login', { replace: true });
    };

    const handleNavigate = () => {
        setSidebarOpen(false);
    };

    return (
        <div className={`shell ${sidebarOpen ? 'shell--menu-open' : ''}`}>
            <aside className="sidebar">
                <div className="brand-card">
                    <span className="brand-card__eyebrow">GGDTools</span>
                    <h1>Goose Goose Duck对局复盘系统</h1>
                    {/* <p></p> */}
                </div>

                <nav className="nav-list" aria-label="主导航">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                            onClick={handleNavigate}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="content-shell">
                <header className="topbar">
                    <button
                        className="menu-button"
                        type="button"
                        onClick={() => setSidebarOpen((value) => !value)}
                        aria-label="切换导航"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <div>
                        <p className="topbar__label">当前登录</p>
                        <strong>{welcomeName}</strong>
                    </div>

                    <button className="ghost-button" type="button" onClick={handleLogout}>
                        退出登录
                    </button>
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>

            <button
                type="button"
                className="backdrop"
                aria-label="关闭导航"
                onClick={() => setSidebarOpen(false)}
            />
        </div>
    );
}

export default Layout;