<!-- match_view.html -->
<div class="match-details-container">
    
    <!-- 加载与错误提示状态栏 -->
    <div id="loading-status" class="status-alert">正在抓取当前对局数据...</div>

    <!-- 核心渲染内容区域（默认隐藏，加载成功后显示） -->
    <div id="content-area" style="display: none;">
        
        <!-- 1. 战绩基本信息面板 -->
        <div class="panel match-summary">
            <h2>📊 对局概览</h2>
            <ul id="match-overview"></ul>
        </div>

        <!-- 2. 玩家表现列表 -->
        <div class="panel players-list">
            <h2>👥 玩家表现</h2>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>玩家昵称</th>
                            <th>阵营 / 职业</th>
                            <th>本局结局</th>
                            <th>击杀</th>
                            <th>任务</th>
                            <th>破坏</th>
                        </tr>
                    </thead>
                    <tbody id="player-list-tbody"></tbody>
                </table>
            </div>
        </div>

        <!-- 3. 局内轮次与投票复盘 -->
        <div class="panel match-rounds">
            <h2>⏱️ 局内轮次复盘</h2>
            <div id="rounds-container"></div>
        </div>
        
    </div>
</div>

<!-- ================= 样式层 (CSS) ================= -->
<!-- ================= 样式层 (CSS) ================= -->
<style>
    :root {
        --bg-color: #f4f6f9;
        --panel-bg: #ffffff;
        --text-color: #333333;
        --text-muted: #888888;
        --border-color: #e0e0e0;
        --win-bg: #ebfbee;
        --win-text: #2b8a3e;
        --voter-text: #1c7ed6;
        --target-text: #e03131;
    }

    .match-details-container {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: 12px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: var(--text-color);
        line-height: 1.6;
    }

    .status-alert {
        text-align: center;
        padding: 30px 15px;
        background: #fff;
        border-radius: 8px;
        color: var(--text-muted);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .panel {
        background-color: var(--panel-bg);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .panel h2 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.15rem;
        border-bottom: 2px solid var(--bg-color);
        padding-bottom: 10px;
    }

    .match-summary ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 12px;
    }
    
    .match-summary ul li {
        font-size: 0.95rem;
        word-break: break-all;
    }

    /* ================= 核心修改：移动端响应式“非滑动”表格 ================= */
    .table-responsive { 
        width: 100%;
        overflow: hidden; /* 极其严格地禁止任何左右溢出滑动 */
    }
    
    .table { 
        width: 100%; 
        border-collapse: collapse; 
    }

    /* 默认移动端状态：将表格元素强行重组为块级卡片布局 */
    .table thead {
        display: none; /* 手机端隐藏传统的表格表头 */
    }

    .table tbody tr {
        display: block; /* 每一行变成一个独立卡片 */
        background: #f8f9fa;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        margin-bottom: 12px;
        padding: 8px 12px;
    }

    .table td { 
        display: flex; /* 利用 flex 让每一列在卡片内部纵向平铺或分左右排列 */
        justify-content: space-between; /* 左边写标签，右边放数据 */
        align-items: center;
        padding: 6px 0; 
        border-bottom: 1px dashed var(--border-color); 
        font-size: 0.9rem;
        text-align: right;
    }

    .table td:last-child {
        border-bottom: none; /* 最后一项去掉虚线 */
    }

    /* 动态为手机端的每一行追加前缀伪元素（伪造表头标签） */
    .table td::before {
        content: attr(data-label); /* 稍后配合下方 JS 或利用原生序号，此处通过更安全的方式处理：直接用伪元素注入 */
        font-weight: 600;
        color: #666;
        float: left;
        text-align: left;
    }

    /* 手动为移动端表格各列赋予伪标签文本 */
    .table td:nth-child(1)::before { content: "玩家昵称"; }
    .table td:nth-child(2)::before { content: "阵营/职业"; }
    .table td:nth-child(3)::before { content: "本局结局"; }
    .table td:nth-child(4)::before { content: "击杀数"; }
    .table td:nth-child(5)::before { content: "完成任务"; }
    .table td:nth-child(6)::before { content: "破坏次数"; }

    /* 移动端特殊行样式修正 */
    .row-win { 
        background-color: var(--win-bg) !important; 
        border-color: #c3e6cb !important;
    }
    .badge-win { color: var(--win-text); font-weight: bold; }
    .text-ghost { text-decoration: line-through; color: var(--text-muted); }

    /* 投票日志部分保持百分百不溢出 */
    .round-box {
        border-left: 4px solid #4dabf7;
        background-color: #f8f9fa;
        padding: 12px 15px;
        margin-bottom: 15px;
        border-radius: 0 8px 8px 0;
    }

    .round-box h3 { margin: 0 0 8px 0; font-size: 1.05rem; color: #228be6; }
    .round-box p { font-size: 0.9rem; margin: 5px 0; }
    
    .vote-log { 
        list-style: none; 
        padding-left: 0; 
        margin: 10px 0 0 0; 
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); /* 根据屏幕宽度自动塞满，绝不溢出 */
        gap: 8px;
    }
    
    .vote-log li {
        padding: 6px 8px;
        background: #fff;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 0.85rem;
        text-align: center;
        word-break: break-all;
    }

    .voter { color: var(--voter-text); font-weight: bold; }
    .target { color: var(--target-text); font-weight: bold; }
    .text-muted { color: var(--text-muted); font-style: italic; }

    /* ================= 响应式媒体查询：PC端恢复为标准大表格 ================= */
    @media (min-width: 768px) {
        .match-details-container { padding: 20px; }
        .panel { padding: 25px; }
        .panel h2 { font-size: 1.3rem; }
        .match-summary ul { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; }
        
        /* 恢复表格标准行为 */
        .table thead { display: table-header-group; }
        .table tbody tr { display: table-row; background: transparent; border: none; }
        .table th, .table td { display: table-cell; padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 1rem; text-align: left; }
        .table th { background-color: #f8f9fa; font-weight: 600; }
        .table td::before { display: none; } /* 隐藏手机端的标签 */
        
        .round-box h3 { font-size: 1.1rem; }
        .vote-log { display: flex; flex-wrap: wrap; }
        .vote-log li { flex: 0 1 auto; text-align: left; font-size: 0.95rem; }
    }
</style>

<!-- ================= 逻辑层 (JavaScript) ================= -->
<script>
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentMatchId = urlParams.get('matchId'); 

    if (!currentMatchId) {
        document.getElementById('loading-status').innerHTML = '❌ <strong style="color:#e03131;">错误：</strong> 未能在当前页面 URL 中检测到 <code>matchId</code> 参数。';
        return;
    }

    fetch('/api/getMatchDetails.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            matchId: currentMatchId 
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('网络通信异常');
        return response.json();
    })
    .then(res => {
        if (!res.success) {
            document.getElementById('loading-status').innerText = `❌ 加载失败: ${res.message || '未知错误'}`;
            return;
        }
        
        document.getElementById('loading-status').style.display = 'none';
        document.getElementById('content-area').style.display = 'block';

        const match = res.data;
        
        renderOverview(match);
        renderPlayers(match.playerData);
        renderRounds(match.rounds, match.playerData);
    })
    .catch(err => {
        console.error('API 请求故障:', err);
        document.getElementById('loading-status').innerText = '❌ 远程对局日志读取失败，请检查网络或刷新重试。';
    });
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderOverview(match) {
    const duration = ((match.endAt - match.startAt) / 1000 / 60).toFixed(1);
    const factionName = match.winningFaction === 2 ? '内鬼' : '船员';
    
    document.getElementById('match-overview').innerHTML = `
        <li><strong>对局 ID:</strong> ${escapeHtml(match.matchId)}</li>
        <li><strong>地图编号:</strong> ${match.map}</li>
        <li><strong>胜利阵营:</strong> <span class="badge-win">${factionName}</span></li>
        <li><strong>对局时长:</strong> ${duration} 分钟</li>
    `;
}

function renderPlayers(playerData) {
    const tbody = document.getElementById('player-list-tbody');
    let html = '';
    
    for (const userId in playerData) {
        const player = playerData[userId];
        
        const rowClass = player.win ? 'row-win' : '';
        const nameClass = player.isGhost ? 'text-ghost' : '';
        const ghostIcon = player.isGhost ? ' 💀' : '';
        const disconnectText = player.disconnected ? ' <span style="color:#e03131;">⚠️断线</span>' : '';
        const resultText = player.win ? '<span class="badge-win">胜利</span>' : '失败';
        
        html += `
            <tr class="${rowClass}">
                <td>
                    <span class="${nameClass}">${escapeHtml(player.nickname)}</span>${ghostIcon}${disconnectText}
                </td>
                <td>阵营 ${player.faction} / 职业 ${player.role}</td>
                <td>${resultText}</td>
                <td>${player.kills}</td>
                <td>${player.tasks}</td>
                <td>${player.sabotages}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function renderRounds(rounds, playerData) {
    const container = document.getElementById('rounds-container');
    let html = '';
    
    if (!rounds || rounds.length === 0) {
        container.innerHTML = '<p class="text-muted">本局未留下任何轮次交锋记录。</p>';
        return;
    }

    rounds.forEach((round, index) => {
        html += `<div class="round-box"><h3>第 ${index + 1} 轮局内会议</h3>`;
        
        if (round.meetingInfo === null) {
            html += `<p class="text-muted">本轮没有触发紧急报告或拍桌会议，对局直接宣告结束。</p>`;
        } else {
            html += `
                <p>
                    <strong>触发源头:</strong> ${escapeHtml(round.meetingInfo.type)} | 
                    <strong>本轮结局:</strong> ${escapeHtml(round.meetingInfo.result)}
                </p>
                <ul class="vote-log">
            `;
            
            const votes = round.meetingInfo.votes;
            for (const voterId in votes) {
                const targetId = votes[voterId];
                
                const voterName = playerData[voterId] ? playerData[voterId].nickname : '未知玩家';
                const targetName = (targetId === 'skip') ? '放弃投票 ↩️' : (playerData[targetId] ? playerData[targetId].nickname : '未知玩家');
                
                html += `
                    <li>
                        <span class="voter">${escapeHtml(voterName)}</span> 
                        👉 投给了 
                        <span class="target">${escapeHtml(targetName)}</span>
                    </li>
                `;
            }
            html += `</ul>`;
        }
        html += `</div>`;
    });
    
    container.innerHTML = html;
}
</script>