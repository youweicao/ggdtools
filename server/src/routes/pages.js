import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../../data/uploads');

const sectionMap = {
    user: '用户管理页',
    game: '游戏管理页',
    details: '对局详情页',
};

const factionMap = {
    1: '鹅阵营',
    2: '鸭阵营',
    3: '中立阵营',
};

const timelineTypeMap = {
    0: '鹅阵营胜利事件',
    1: '鸭阵营胜利事件',
    2: '击杀',
    3: '放逐/会议结算',
    5: '技能触发',
    1027: '特殊技能事件',
    1043: '事件 1043',
    1048: '事件 1048',
};

function parseMatch(raw) {
    const players = Object.values(raw.playerData || {}).map((player) => ({
        userId: player.userId,
        nickname: player.nickname || player.userId,
        role: player.role,
        faction: player.faction,
        factionName: factionMap[player.faction] || `未知阵营(${player.faction})`,
        win: Boolean(player.win),
        kills: Number(player.kills || 0),
        tasks: Number(player.tasks || 0),
        sabotages: Number(player.sabotages || 0),
        discussions: Number(player.discussions || 0),
        correctVotes: Number(player.correctVotes || 0),
        disconnected: Boolean(player.disconnected),
        isGhost: Boolean(player.isGhost),
        deadAt: Number(player.deadAt || 0),
        turnsSurvived: Number(player.turnsSurvived || 0),
    }));

    const playerById = new Map(players.map((player) => [player.userId, player.nickname]));

    const factionStats = players.reduce((acc, player) => {
        const key = String(player.faction);
        if (!acc[key]) {
            acc[key] = { faction: player.faction, factionName: player.factionName, total: 0, winners: 0 };
        }
        acc[key].total += 1;
        if (player.win) acc[key].winners += 1;
        return acc;
    }, {});

    const rounds = (raw.rounds || []).map((round, index) => {
        const votes = Object.entries(round.meetingInfo?.votes || {}).map(([from, to]) => ({
            from,
            fromName: playerById.get(from) || from,
            to,
            toName: to === 'skip' ? '跳过' : (playerById.get(to) || to),
        }));

        const timeline = (round.timeline || []).map((event) => ({
            timestamp: Number(event.timestamp || 0),
            type: Number(event.type || 0),
            typeLabel: timelineTypeMap[event.type] || `事件 ${event.type}`,
            uid: event.uid,
            uidName: playerById.get(event.uid) || event.uid,
            targetId: event.targetId,
            targetName: event.targetId ? (playerById.get(event.targetId) || event.targetId) : '-',
        }));

        return {
            index: index + 1,
            startAt: Number(round.startAt || 0),
            endAt: Number(round.endAt || 0),
            meetingInfo: {
                starter: round.meetingInfo?.starter,
                starterName: playerById.get(round.meetingInfo?.starter) || round.meetingInfo?.starter || '-',
                type: round.meetingInfo?.type || '-',
                startTime: Number(round.meetingInfo?.startTime || 0),
                result: round.meetingInfo?.result || '-',
                resultName:
                    round.meetingInfo?.result === 'skip'
                        ? '跳过'
                        : (playerById.get(round.meetingInfo?.result) || round.meetingInfo?.result || '-'),
                voteCount: votes.length,
            },
            votes,
            timeline,
        };
    });

    const allEvents = rounds
        .flatMap((round) => round.timeline.map((event) => ({ ...event, round: round.index })))
        .sort((a, b) => a.timestamp - b.timestamp);

    const winners = players.filter((player) => player.win);
    const topKills = [...players].sort((a, b) => b.kills - a.kills)[0] || null;
    const topTasks = [...players].sort((a, b) => b.tasks - a.tasks)[0] || null;
    const disconnectedCount = players.filter((player) => player.disconnected).length;
    const ghostCount = players.filter((player) => player.isGhost).length;

    return {
        summary: {
            matchId: raw.matchId || '-',
            map: raw.map,
            mode: raw.mode,
            winningFaction: raw.winningFaction,
            winningFactionName: factionMap[raw.winningFaction] || `未知阵营(${raw.winningFaction})`,
            startAt: Number(raw.startAt || 0),
            endAt: Number(raw.endAt || 0),
            durationMs: Math.max(0, Number(raw.endAt || 0) - Number(raw.startAt || 0)),
            totalPlayers: players.length,
            totalRounds: rounds.length,
            disconnectedCount,
            ghostCount,
            topKillPlayer: topKills,
            topTaskPlayer: topTasks,
            winners,
        },
        factionStats: Object.values(factionStats),
        players,
        rounds,
        timeline: allEvents,
    };
}

async function readMatchByOriginalName(baseName) {
    const normalized = decodeURIComponent(String(baseName || '')).trim();
    const withExt = normalized.endsWith('.json') ? normalized : `${normalized}.json`;
    const [files] = await pool.execute(
        `SELECT id, original_name, stored_name, mime_type, size, created_at
         FROM \`files\`
         WHERE original_name IN (?, ?) OR stored_name IN (?, ?)
         ORDER BY id DESC
         LIMIT 1`,
        [normalized, withExt, normalized, withExt],
    );

    if (!files.length) {
        const error = new Error('未找到对应对局文件');
        error.status = 404;
        throw error;
    }

    const fileInfo = files[0];
    const fullPath = path.join(UPLOAD_DIR, fileInfo.stored_name);
    const rawText = await readFile(fullPath, 'utf8');

    let raw;
    try {
        raw = JSON.parse(rawText);
    } catch {
        const error = new Error('文件不是合法 JSON，无法解析对局数据');
        error.status = 400;
        throw error;
    }

    return {
        file: {
            id: fileInfo.id,
            originalName: fileInfo.original_name,
            storedName: fileInfo.stored_name,
            mimeType: fileInfo.mime_type,
            size: fileInfo.size,
            createdAt: fileInfo.created_at,
            routeKey: fileInfo.original_name.replace(/\.json$/i, ''),
        },
        ...parseMatch(raw),
    };
}

router.get('/:section/:id', authenticateToken, async (request, response) => {
    const { section, id } = request.params;

    if (!sectionMap[section]) {
        return response.status(404).json({ message: '页面类型不存在' });
    }

    if (section === 'details') {
        try {
            const detailData = await readMatchByOriginalName(id);
            return response.json(detailData);
        } catch (error) {
            return response.status(error.status || 500).json({ message: error.message || '读取对局文件失败' });
        }
    }

    return response.json({
        meta: {
            section,
            id,
            description: `${sectionMap[section]}已通过服务端鉴权`,
        },
        payload: {
            route: `/${section}/${id}`,
            requestedAt: new Date().toISOString(),
            currentUser: request.user,
        },
    });
});

export default router;