import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageData } from '../services/api';

function EntityPage({ section, title }) {
    const { id } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadPage() {
            setLoading(true);
            setErrorMessage('');

            try {
                const response = await fetchPageData(section, id);

                if (!cancelled) {
                    setPageData(response);
                }
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            cancelled = true;
        };
    }, [id, section]);

    return (
        <div className="page-stack">
            <section className="panel panel--hero">
                <div>
                    <p className="panel-label">{section.toUpperCase()}</p>
                    <h2>
                        {title} #{id}
                    </h2>
                    <p>这是一个受保护的动态路由页面，只有登录后才可访问。</p>
                </div>
            </section>

            {loading ? <section className="panel">页面数据加载中...</section> : null}
            {errorMessage ? <section className="panel error-text">{errorMessage}</section> : null}

            {pageData ? (
                <section className="detail-grid">
                    <article className="panel detail-card">
                        <span>页面标识</span>
                        <strong>{pageData.meta.section}</strong>
                        <p>{pageData.meta.description}</p>
                    </article>

                    <article className="panel detail-card">
                        <span>当前 ID</span>
                        <strong>{pageData.meta.id}</strong>
                        <p>通过 React Router 动态参数解析。</p>
                    </article>

                    <article className="panel detail-card detail-card--wide">
                        <span>服务端返回数据</span>
                        <pre>{JSON.stringify(pageData.payload, null, 2)}</pre>
                    </article>
                </section>
            ) : null}
        </div>
    );
}

export default EntityPage;