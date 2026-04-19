import { useEffect, useRef, useState } from 'react';
import { createReplay, deleteReplay, fetchReplays, updateReplay } from '../services/api';

const EMPTY_FORM = { title: '', notes: '', result: '', players: '' };

function ReplayPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalMode, setModalMode] = useState(null); // 'create' | 'edit'
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [confirmId, setConfirmId] = useState(null);

    const titleRef = useRef(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchReplays();
            setList(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (modalMode) setTimeout(() => titleRef.current?.focus(), 60);
    }, [modalMode]);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setFormError('');
        setEditTarget(null);
        setModalMode('create');
    };

    const openEdit = (replay) => {
        setForm({
            title: replay.title || '',
            notes: replay.notes || '',
            result: replay.result || '',
            players: Array.isArray(replay.players)
                ? replay.players.join(', ')
                : (replay.players ? JSON.parse(replay.players).join(', ') : ''),
        });
        setFormError('');
        setEditTarget(replay);
        setModalMode('edit');
    };

    const closeModal = () => { setModalMode(null); setEditTarget(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const buildPayload = () => ({
        title: form.title.trim(),
        notes: form.notes.trim() || null,
        result: form.result.trim() || null,
        players: form.players ? form.players.split(',').map((s) => s.trim()).filter(Boolean) : [],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!form.title.trim()) { setFormError('对局标题不能为空'); return; }
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await createReplay(buildPayload());
            } else {
                await updateReplay(editTarget.id, buildPayload());
            }
            closeModal();
            await load();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmId) return;
        try {
            await deleteReplay(confirmId);
            setConfirmId(null);
            await load();
        } catch (err) {
            setError(err.message);
            setConfirmId(null);
        }
    };

    const fmt = (iso) => iso ? new Date(iso).toLocaleString('zh-CN', { hour12: false }) : '—';

    return (
        <div className="page-stack">
            <section className="panel panel--hero replay-header">
                <div>
                    <p className="panel-label">REPLAYS</p>
                    <h2>对局管理</h2>
                    <p>管理服务器上存储的所有 Goose Goose Duck 对局复盘记录。</p>
                </div>
                <button className="primary-button" type="button" onClick={openCreate}>
                    + 新建对局
                </button>
            </section>

            {error && <p className="panel error-text">{error}</p>}

            {loading ? (
                <section className="panel">加载中...</section>
            ) : list.length === 0 ? (
                <section className="panel replay-empty">
                    <p>暂无对局记录，点击「新建对局」开始添加。</p>
                </section>
            ) : (
                <section className="replay-table-wrap panel">
                    <table className="replay-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>标题</th>
                                <th>对局结果</th>
                                <th>备注</th>
                                <th>更新时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((r) => (
                                <tr key={r.id}>
                                    <td className="replay-id">#{r.id}</td>
                                    <td className="replay-title">{r.title}</td>
                                    <td>
                                        {r.result
                                            ? <span className="replay-badge">{r.result}</span>
                                            : <span className="replay-empty-cell">—</span>}
                                    </td>
                                    <td className="replay-notes">{r.notes || <span className="replay-empty-cell">—</span>}</td>
                                    <td className="replay-time">{fmt(r.updated_at)}</td>
                                    <td className="replay-actions">
                                        <button
                                            className="ghost-button ghost-button--sm"
                                            type="button"
                                            onClick={() => openEdit(r)}
                                        >
                                            编辑
                                        </button>
                                        <button
                                            className="danger-button danger-button--sm"
                                            type="button"
                                            onClick={() => setConfirmId(r.id)}
                                        >
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Create / Edit Modal */}
            {modalMode && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? '新建对局' : '编辑对局'}</h3>
                            <button className="modal-close" type="button" onClick={closeModal}>✕</button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <label>
                                <span>标题 *</span>
                                <input
                                    ref={titleRef}
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="例：第109局 天文台"
                                />
                            </label>
                            <label>
                                <span>对局结果</span>
                                <input
                                    name="result"
                                    value={form.result}
                                    onChange={handleChange}
                                    placeholder="例：鹅队胜利 / 鸭队胜利"
                                />
                            </label>
                            <label>
                                <span>参与玩家（逗号分隔）</span>
                                <input
                                    name="players"
                                    value={form.players}
                                    onChange={handleChange}
                                    placeholder="例：玩家A, 玩家B, 玩家C"
                                />
                            </label>
                            <label>
                                <span>备注</span>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="复盘分析、关键时间点等..."
                                />
                            </label>
                            {formError && <p className="error-text">{formError}</p>}
                            <div className="modal-footer">
                                <button className="ghost-button" type="button" onClick={closeModal}>取消</button>
                                <button className="primary-button" type="submit" disabled={submitting}>
                                    {submitting ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmId && (
                <div className="modal-backdrop" onClick={() => setConfirmId(null)}>
                    <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>确认删除</h3>
                            <button className="modal-close" type="button" onClick={() => setConfirmId(null)}>✕</button>
                        </div>
                        <p style={{ margin: '8px 0 24px' }}>此操作不可恢复，确定要删除该对局记录吗？</p>
                        <div className="modal-footer">
                            <button className="ghost-button" type="button" onClick={() => setConfirmId(null)}>取消</button>
                            <button className="danger-button" type="button" onClick={handleDelete}>确认删除</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReplayPage;
