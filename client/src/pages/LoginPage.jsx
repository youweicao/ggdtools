import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [formState, setFormState] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const nextPath = location.state?.from || '/dashboard';

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSubmitting(true);

        try {
            const session = await login(formState);
            onLogin(session);
            navigate(nextPath, { replace: true });
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <section className="login-hero">
                {/* <p className="login-hero__eyebrow">Responsive Admin</p> */}
                <h1>GGDTools | 鹅鸭杀复盘工具</h1>
                {/* <p>
                    统一处理登录、基础鉴权和动态路由访问，桌面端与手机端使用同一套界面逻辑。
                </p> */}

                {/* <div className="hero-metrics">
                    <article>
                        <strong>/user/:id</strong>
                        <span>用户信息管理</span>
                    </article>
                    <article>
                        <strong>/game/:id</strong>
                        <span>游戏业务入口</span>
                    </article>
                    <article>
                        <strong>/details/:id</strong>
                        <span>详情数据视图</span>
                    </article>
                </div> */}
            </section>

            <section className="login-panel">
                <div className="login-card">
                    <div>
                        <p className="panel-label">账号登录</p>
                        <h2>进入管理后台</h2>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <label>
                            <span>用户名</span>
                            <input
                                name="username"
                                placeholder="请输入用户名"
                                value={formState.username}
                                onChange={handleChange}
                                autoComplete="username"
                            />
                        </label>

                        <label>
                            <span>密码</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="请输入密码"
                                value={formState.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </label>

                        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

                        <button className="primary-button" type="submit" disabled={submitting}>
                            {submitting ? '登录中...' : '登录'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default LoginPage;