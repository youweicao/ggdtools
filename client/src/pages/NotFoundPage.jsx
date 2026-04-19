import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <section className="panel page-stack">
            <p className="panel-label">404</p>
            <h2>页面不存在</h2>
            <p>当前地址未匹配到任何后台页面。</p>
            <Link className="primary-button primary-button--inline" to="/dashboard">
                返回控制台
            </Link>
        </section>
    );
}

export default NotFoundPage;