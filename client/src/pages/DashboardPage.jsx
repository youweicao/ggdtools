const dashboardCards = [
    {
        label: '路由模式',
        value: '动态参数路由',
        description: '已接入 /user/:id、/game/:id、/details/:id',
    },
    {
        label: '鉴权方式',
        value: 'JWT',
        description: '登录成功后持久化 token，未登录无法访问后台页面',
    },
    {
        label: '数据库',
        value: 'MySQL 127.0.0.1:3306',
        description: '登录从 ggdtools.user 表读取账号数据',
    },
];

function DashboardPage({ session }) {
    return (
        <div className="page-stack">
            <section className="panel panel--hero">
                <div>
                    <p className="panel-label">Dashboard</p>
                    <h2>欢迎回来，{session?.user?.displayName || session?.user?.username}</h2>
                    <p>
                        当前项目已经具备基础后台能力：登录、受保护路由、动态参数页面和移动端适配布局。
                    </p>
                </div>
            </section>

            <section className="stats-grid">
                {dashboardCards.map((card) => (
                    <article key={card.label} className="panel stat-card">
                        <span>{card.label}</span>
                        <strong>{card.value}</strong>
                        <p>{card.description}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export default DashboardPage;