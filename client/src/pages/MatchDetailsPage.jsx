import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMatchDetails } from '../services/api';

const meetingTypeMap = {
    Report: '报警',
    Emergency: '拉铃',
};

const timelineActionMap = {
    0: '鹅阵营获胜结算',
    1: '鸭阵营获胜结算',
    2: '击杀',
    3: '放逐/会议结算',
    5: '技能生效',
    1027: '特殊技能事件',
    1043: '特殊事件 1043',
    1048: '特殊事件 1048',
};

function fmtDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function fmtDuration(durationMs) {
    if (!durationMs) return '0s';
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return `${minutes}m ${remain}s`;
}

function MatchDetailsPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError('');
            try {
                const res = await fetchMatchDetails(id);
                if (!cancelled) setData(res);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const sortedPlayers = useMemo(() => {
        if (!data?.players) return [];
        return [...data.players].sort((a, b) => {
            if (b.win !== a.win) return Number(b.win) - Number(a.win);
            if (b.kills !== a.kills) return b.kills - a.kills;
            return b.tasks - a.tasks;
        });
    }, [data]);

    const playerById = useMemo(() => {
        const map = new Map();
        (data?.players || []).forEach((player) => {
            map.set(player.userId, player);
        });
        return map;
    }, [data]);

    const timelineNarrative = useMemo(() => {
        if (!data) return [];

        const events = [];

        data.rounds.forEach((round) => {
            if (round.meetingInfo.startTime) {
                const starter = playerById.get(round.meetingInfo.starter);
                events.push({
                    timestamp: round.meetingInfo.startTime,
                    round: round.index,
                    actorName: round.meetingInfo.starterName,
                    actorRole: starter ? `身份#${starter.role}` : '-',
                    action: `开会(${meetingTypeMap[round.meetingInfo.type] || round.meetingInfo.type})`,
                    targetName: round.meetingInfo.resultName || '-',
                    targetRole: '-',
                    note: `会议结果: ${round.meetingInfo.resultName || '-'}`,
                });
            }

            round.timeline.forEach((event) => {
                const actor = playerById.get(event.uid);
                const target = playerById.get(event.targetId);
                const action = timelineActionMap[event.type] || event.typeLabel || `事件 ${event.type}`;
                events.push({
                    timestamp: event.timestamp,
                    round: round.index,
                    actorName: event.uidName || event.uid || '-',
                    actorRole: actor ? `身份#${actor.role}` : '-',
                    action,
                    targetName: event.targetName || '-',
                    targetRole: target ? `身份#${target.role}` : '-',
                    note: `事件类型: ${event.type}`,
                });
            });
        });

        (data.players || []).forEach((player) => {
            if (player.deadAt) {
                events.push({
                    timestamp: player.deadAt,
                    round: '-',
                    actorName: player.nickname,
                    actorRole: `身份#${player.role}`,
                    action: '死亡',
                    targetName: '-',
                    targetRole: '-',
                    note: '玩家转为幽灵状态',
                });
            }
        });

        return events.sort((a, b) => a.timestamp - b.timestamp);
    }, [data, playerById]);

    return (
        <div className="page-stack">
            <section className="panel panel--hero">
                <div>
                    <p className="panel-label">MATCH DETAILS</p>
                    <h2>对局详情: {id}</h2>
                    <p>按文件名读取并解析对局 JSON，展示玩家、阵营、会议投票与关键事件时间线。</p>
                </div>
            </section>

            {loading ? <section className="panel">对局数据加载中...</section> : null}
            {error ? <section className="panel error-text">{error}</section> : null}

            {data ? (
                <>
                    <section className="detail-grid">
                        <article className="panel detail-card">
                            <span>Match ID</span>
                            <strong>{data.summary.matchId}</strong>
                            <p>文件: {data.file.originalName}</p>
                        </article>
                        <article className="panel detail-card">
                            <span>胜利阵营</span>
                            <strong>{data.summary.winningFactionName}</strong>
                            <p>阵营编号: {data.summary.winningFaction}</p>
                        </article>
                        <article className="panel detail-card">
                            <span>对局时长</span>
                            <strong>{fmtDuration(data.summary.durationMs)}</strong>
                            <p>{fmtDate(data.summary.startAt)} ~ {fmtDate(data.summary.endAt)}</p>
                        </article>
                    </section>

                    <section className="detail-grid">
                        <article className="panel detail-card">
                            <span>玩家总数</span>
                            <strong>{data.summary.totalPlayers}</strong>
                            <p>回合数: {data.summary.totalRounds}</p>
                        </article>
                        <article className="panel detail-card">
                            <span>掉线 / 幽灵</span>
                            <strong>{data.summary.disconnectedCount} / {data.summary.ghostCount}</strong>
                            <p>用于判断异常局势与残局信息。</p>
                        </article>
                        <article className="panel detail-card detail-card--wide">
                            <span>阵营分布</span>
                            <div className="match-chip-row">
                                {data.factionStats.map((f) => (
                                    <span key={f.faction} className="match-chip">
                                        {f.factionName}: {f.total} 人 / 胜利 {f.winners}
                                    </span>
                                ))}
                            </div>
                            <p>
                                MVP 击杀: {data.summary.topKillPlayer?.nickname || '—'} ({data.summary.topKillPlayer?.kills || 0})
                                ，MVP 任务: {data.summary.topTaskPlayer?.nickname || '—'} ({data.summary.topTaskPlayer?.tasks || 0})
                            </p>
                        </article>
                    </section>

                    <section className="panel">
                        <h3 className="section-title">胜利玩家</h3>
                        <div className="match-chip-row">
                            {data.summary.winners.length
                                ? data.summary.winners.map((player) => (
                                    <span key={player.userId} className="match-chip match-chip--win">
                                        {player.nickname} ({player.factionName})
                                    </span>
                                ))
                                : <span className="file-dim">无</span>}
                        </div>
                    </section>

                    <section className="panel match-table-wrap">
                        <h3 className="section-title">玩家身份与数据</h3>
                        <table className="match-table match-table--beauty">
                            <thead>
                                <tr>
                                    <th>昵称</th>
                                    <th>身份</th>
                                    <th>阵营</th>
                                    <th>胜负</th>
                                    <th>击杀</th>
                                    <th>任务</th>
                                    <th>讨论</th>
                                    <th>纠正投票</th>
                                    <th>状态</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPlayers.map((p) => (
                                    <tr key={p.userId}>
                                        <td>{p.nickname}</td>
                                        <td>#{p.role}</td>
                                        <td>{p.factionName}</td>
                                        <td>{p.win ? '胜利' : '失败'}</td>
                                        <td>{p.kills}</td>
                                        <td>{p.tasks}</td>
                                        <td>{p.discussions}</td>
                                        <td>{p.correctVotes}</td>
                                        <td>{p.disconnected ? '掉线' : (p.isGhost ? '幽灵' : '存活')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="panel">
                        <h3 className="section-title">时间线叙事（谁在什么时间做了什么）</h3>
                        <div className="match-table-wrap">
                            <table className="match-table match-table--beauty">
                                <thead>
                                    <tr>
                                        <th>时间</th>
                                        <th>回合</th>
                                        <th>行动者</th>
                                        <th>行为</th>
                                        <th>目标</th>
                                        <th>说明</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timelineNarrative.map((item, index) => (
                                        <tr key={`${item.timestamp}-${item.actorName}-${index}`}>
                                            <td>{fmtDate(item.timestamp)}</td>
                                            <td>{item.round === '-' ? '-' : `#${item.round}`}</td>
                                            <td>
                                                <div className="match-cell-main">{item.actorName}</div>
                                                <div className="match-cell-sub">{item.actorRole}</div>
                                            </td>
                                            <td><span className="match-event-tag">{item.action}</span></td>
                                            <td>
                                                <div className="match-cell-main">{item.targetName}</div>
                                                <div className="match-cell-sub">{item.targetRole}</div>
                                            </td>
                                            <td className="match-cell-sub">{item.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="panel">
                        <h3 className="section-title">回合会议与投票明细</h3>
                        <div className="match-round-list">
                            {data.rounds.map((round) => (
                                <article key={round.index} className="match-round-card">
                                    <div className="match-round-head">
                                        <strong>第 {round.index} 回合</strong>
                                        <span>{fmtDate(round.startAt)} - {fmtDate(round.endAt)}</span>
                                    </div>
                                    <p>
                                        发起人: {round.meetingInfo.starterName}，类型: {meetingTypeMap[round.meetingInfo.type] || round.meetingInfo.type}，结果: {round.meetingInfo.resultName}
                                    </p>
                                    <p>投票数: {round.meetingInfo.voteCount}，时间线事件: {round.timeline.length}</p>
                                    <div className="match-table-wrap">
                                        <table className="match-table match-table--compact">
                                            <thead>
                                                <tr>
                                                    <th>投票者</th>
                                                    <th>投给</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {round.votes.map((vote, voteIdx) => {
                                                    const voter = playerById.get(vote.from);
                                                    const target = playerById.get(vote.to);
                                                    return (
                                                        <tr key={`${round.index}-${vote.from}-${voteIdx}`}>
                                                            <td>
                                                                <div className="match-cell-main">{vote.fromName}</div>
                                                                <div className="match-cell-sub">{voter ? `身份#${voter.role}` : '-'}</div>
                                                            </td>
                                                            <td>
                                                                <div className="match-cell-main">{vote.toName}</div>
                                                                <div className="match-cell-sub">{target ? `身份#${target.role}` : (vote.to === 'skip' ? '跳过' : '-')}</div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="panel match-table-wrap">
                        <h3 className="section-title">关键事件时间线</h3>
                        <table className="match-table match-table--beauty">
                            <thead>
                                <tr>
                                    <th>时间</th>
                                    <th>回合</th>
                                    <th>事件类型</th>
                                    <th>发起者</th>
                                    <th>目标</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.timeline.map((event, idx) => (
                                    <tr key={`${event.timestamp}-${event.uid}-${idx}`}>
                                        <td>{fmtDate(event.timestamp)}</td>
                                        <td>#{event.round}</td>
                                        <td>{event.typeLabel}</td>
                                        <td>{event.uidName || event.uid || '-'}</td>
                                        <td>{event.targetName || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            ) : null}
        </div>
    );
}

export default MatchDetailsPage;
