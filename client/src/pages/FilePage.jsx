import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteFile, downloadFile, fetchFiles, patchFile, uploadFile } from '../services/api';

const UNITS = ['B', 'KB', 'MB', 'GB'];
function fmtSize(bytes) {
    if (!bytes) return '—';
    let v = Number(bytes), i = 0;
    while (v >= 1024 && i < UNITS.length - 1) { v /= 1024; i++; }
    return `${v.toFixed(i ? 1 : 0)} ${UNITS[i]}`;
}
function fmtDate(iso) {
    return iso ? new Date(iso).toLocaleString('zh-CN', { hour12: false }) : '—';
}
function fileIcon(mime) {
    if (!mime) return '📄';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('zip') || mime.includes('compressed') || mime.includes('tar')) return '📦';
    if (mime.includes('json') || mime.includes('xml') || mime.includes('text')) return '📝';
    return '📄';
}

function FilePage() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const [editTarget, setEditTarget] = useState(null);
    const [editDesc, setEditDesc] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const [confirmId, setConfirmId] = useState(null);

    const fileInputRef = useRef(null);
    const descRef = useRef(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try { setList(await fetchFiles()); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { if (editTarget) setTimeout(() => descRef.current?.focus(), 60); }, [editTarget]);

    const handleUpload = async (files) => {
        if (!files?.length) return;
        setUploadError('');
        setUploading(true);
        try {
            for (const f of files) {
                const fd = new FormData();
                fd.append('file', f);
                await uploadFile(fd);
            }
            await load();
        } catch (e) { setUploadError(e.message); }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const handleEditSave = async () => {
        setEditSaving(true); setEditError('');
        try {
            await patchFile(editTarget.id, editDesc);
            setEditTarget(null);
            await load();
        } catch (e) { setEditError(e.message); }
        finally { setEditSaving(false); }
    };

    const handleDelete = async () => {
        if (!confirmId) return;
        try { await deleteFile(confirmId); setConfirmId(null); await load(); }
        catch (e) { setError(e.message); setConfirmId(null); }
    };

    const handleDownload = (file) => downloadFile(file.id, file.original_name).catch((e) => setError(e.message));
    const handleViewMatch = (file) => {
        const routeKey = file.original_name.replace(/\.json$/i, '');
        navigate(`/details/${encodeURIComponent(routeKey)}`);
    };

    return (
        <div className="page-stack">
            <section className="panel panel--hero file-header">
                <div>
                    <p className="panel-label">FILES</p>
                    <h2>文件管理</h2>
                    <p>上传、下载和管理后台服务器文件。</p>
                </div>
                <button className="primary-button" type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? '上传中…' : '+ 上传文件'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleUpload(e.target.files)}
                />
            </section>

            {/* Drop zone */}
            <section
                className={`panel file-dropzone${dragOver ? ' file-dropzone--active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading
                    ? <span className="file-drop-hint">正在上传，请稍候…</span>
                    : <span className="file-drop-hint">拖拽文件到此处，或点击选择文件</span>}
            </section>

            {uploadError && <p className="panel error-text">{uploadError}</p>}
            {error && <p className="panel error-text">{error}</p>}

            {loading ? (
                <section className="panel">加载中…</section>
            ) : list.length === 0 ? (
                <section className="panel file-empty"><p>暂无文件，点击「上传文件」或拖入文件开始使用。</p></section>
            ) : (
                <section className="panel file-table-wrap">
                    <table className="file-table">
                        <thead>
                            <tr>
                                <th>文件</th>
                                <th>大小</th>
                                <th>备注</th>
                                <th>上传时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((f) => (
                                <tr key={f.id}>
                                    <td className="file-name-cell">
                                        <span className="file-icon">{fileIcon(f.mime_type)}</span>
                                        <span className="file-name">{f.original_name}</span>
                                    </td>
                                    <td className="file-meta">{fmtSize(f.size)}</td>
                                    <td className="file-meta file-desc">
                                        {f.description || <span className="file-dim">—</span>}
                                    </td>
                                    <td className="file-meta">{fmtDate(f.created_at)}</td>
                                    <td className="file-actions">
                                        {/\.json$/i.test(f.original_name) ? (
                                            <button className="ghost-button ghost-button--sm" type="button" onClick={() => handleViewMatch(f)}>
                                                查看对局
                                            </button>
                                        ) : null}
                                        <button className="ghost-button ghost-button--sm" type="button" onClick={() => handleDownload(f)}>下载</button>
                                        <button className="ghost-button ghost-button--sm" type="button" onClick={() => { setEditTarget(f); setEditDesc(f.description || ''); setEditError(''); }}>编辑</button>
                                        <button className="danger-button danger-button--sm" type="button" onClick={() => setConfirmId(f.id)}>删除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Edit description modal */}
            {editTarget && (
                <div className="modal-backdrop" onClick={() => setEditTarget(null)}>
                    <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>编辑备注</h3>
                            <button className="modal-close" type="button" onClick={() => setEditTarget(null)}>✕</button>
                        </div>
                        <p className="file-modal-filename">{editTarget.original_name}</p>
                        <textarea
                            ref={descRef}
                            className="file-desc-input"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="添加备注说明…"
                            rows={4}
                        />
                        {editError && <p className="error-text">{editError}</p>}
                        <div className="modal-footer">
                            <button className="ghost-button" type="button" onClick={() => setEditTarget(null)}>取消</button>
                            <button className="primary-button" type="button" onClick={handleEditSave} disabled={editSaving}>
                                {editSaving ? '保存中…' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {confirmId && (
                <div className="modal-backdrop" onClick={() => setConfirmId(null)}>
                    <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>确认删除</h3>
                            <button className="modal-close" type="button" onClick={() => setConfirmId(null)}>✕</button>
                        </div>
                        <p style={{ margin: '8px 0 24px' }}>文件将从服务器永久删除，不可恢复。确认继续？</p>
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

export default FilePage;
