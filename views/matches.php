<div class="matches-view">

    <style>
        .matches-view {
            font-family: Arial, sans-serif;
            padding: 12px;
            box-sizing: border-box;
            overflow-x: hidden; 
            width: 100%;
        }

        /* ---------------- KPI & 角色盒子 ---------------- */
        .matches-view .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }

        .matches-view .scroll-container {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 12px;
            margin-bottom: 20px;
            -webkit-overflow-scrolling: touch; 
        }

        .matches-view .scroll-container::-webkit-scrollbar {
            height: 4px;
        }
        .matches-view .scroll-container::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 2px;
        }

        .matches-view .card,
        .matches-view .scroll-container .card {
            background: #fff;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            font-size: 13px;
            box-sizing: border-box;
        }

        .matches-view .scroll-container .card {
            flex: 0 0 130px;
        }

        /* ---------------- 最近对局：移动端流式布局 ---------------- */
        .matches-view .match-list-container {
            width: 100%;
            box-sizing: border-box;
        }

        .matches-view .responsive-table {
            display: block;
            width: 100%;
        }

        .matches-view .responsive-table thead {
            display: none;
        }

        .matches-view .responsive-table tbody {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
        }

        .matches-view .responsive-table tr {
            display: flex;
            flex-wrap: wrap; 
            gap: 8px 12px;   
            background: #fff;
            padding: 14px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
            box-sizing: border-box;
            width: 100%;
            position: relative;
        }

        .matches-view .responsive-table td {
            display: inline-flex;
            align-items: center;
            font-size: 13px;
            color: #333;
            padding: 0;
            border: none;
            text-align: left;
            white-space: normal; 
            word-break: break-all;
        }

        .matches-view .responsive-table td::before {
            content: attr(data-label) ": ";
            color: #888;
            font-size: 11px;
            margin-right: 4px;
            font-weight: normal;
        }
        
        .matches-view .responsive-table td[data-label="序号"]::before { content: "#"; color: #999; }
        .matches-view .responsive-table td[data-label="结果"]::before { display: none; }
        .matches-view .responsive-table td[data-label="阵营"]::before { display: none; }
        .matches-view .responsive-table td[data-label="操作"]::before { display: none; }

        /* 手机端操作按钮样式 */
        .matches-view .responsive-table td[data-label="操作"] {
            width: 100%;
            margin-top: 4px;
            display: block;
        }

        .matches-view .btn-detail {
            display: inline-block;
            width: 100%;
            text-align: center;
            background: #f0f2f5;
            color: #007aff;
            font-size: 12px;
            padding: 8px 0;
            border-radius: 6px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            box-sizing: border-box;
            transition: background 0.2s;
        }
        .matches-view .btn-detail:hover {
            background: #e4e6e9;
        }

        /* 状态标签 */
        .tag-win { color: #2ecc71; font-weight: bold; background: #e8f8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        .tag-loss { color: #e74c3c; font-weight: bold; background: #fdeaea; padding: 2px 6px; border-radius: 4px; font-size: 11px; }

        .faction-goose { color: #1abc9c; font-weight: bold; background: #e8f8f5; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        .faction-duck { color: #e67e22; font-weight: bold; background: #fdf2e9; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        .faction-neutral { color: #9b59b6; font-weight: bold; background: #f5eef8; padding: 2px 6px; border-radius: 4px; font-size: 11px; }

        .loading {
            padding: 20px;
            text-align: center;
            color: #888;
        }

        /* ======================================================== */
        /* 媒体查询：PC端恢复正规表格 */
        /* ======================================================== */
        @media (min-width: 768px) {
            .matches-view {
                padding: 0;
                overflow-x: visible;
            }
            .matches-view .grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }
            .matches-view .scroll-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 12px;
                overflow-x: visible;
                padding-bottom: 0;
            }
            .matches-view .scroll-container .card {
                flex: unset;
                font-size: 14px;
            }

            .matches-view .responsive-table {
                display: table !important;
                border-collapse: collapse;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            }
            .matches-view .responsive-table thead {
                display: table-header-group !important;
            }
            .matches-view .responsive-table th {
                background: #f0f2f5;
                padding: 12px 10px;
                font-size: 13px;
                text-align: center;
            }
            .matches-view .responsive-table tbody {
                display: table-row-group !important;
            }
            .matches-view .responsive-table tr {
                display: table-row !important;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
            }
            .matches-view .responsive-table td {
                display: table-cell !important;
                padding: 12px 10px;
                border-bottom: 1px solid #eee;
                text-align: center;
                white-space: nowrap;
            }
            .matches-view .responsive-table td::before {
                display: none !important;
            }

            .matches-view .responsive-table td[data-label="操作"] {
                width: auto;
                margin-top: 0;
            }
            .matches-view .btn-detail {
                width: auto;
                padding: 4px 10px;
                background: none;
                color: #007aff;
            }
            .matches-view .btn-detail:hover {
                background: #f0f2f5;
                text-decoration: underline;
            }

            .tag-win, .tag-loss, .faction-goose, .faction-duck, .faction-neutral { background: none; padding: 0; }
            .faction-goose { color: #1abc9c; }
            .faction-duck { color: #e67e22; }
            .faction-neutral { color: #9b59b6; }
        }
    </style>

    <!-- 顶部 KPI -->
    <div id="kpi" class="grid"></div>

    <!-- 职业 Breakdown -->
    <div id="roles" class="scroll-container"></div>

    <!-- 战绩列表 -->
    <div class="section">
        <h3>最近对局</h3>
        <div id="loading" class="loading">加载中...</div>

        <div class="match-list-container">
            <table id="matchTable" class="responsive-table" style="display:none;">
                <thead>
                <tr>
                    <th>序号</th>
                    <th>阵营</th>
                    <th>角色</th>
                    <th>地图</th>
                    <th>模式</th>
                    <th>结果</th>
                    <th>存活</th>
                    <th>击杀</th>
                    <th>投票</th>
                    <th>时间</th>
                    <th>操作</th>
                </tr>
                </thead>
                <tbody id="matchBody"></tbody>
            </table>
        </div>
    </div>

</div>

<script>
document.addEventListener("DOMContentLoaded", async function () {

    const kpiBox = document.getElementById("kpi");
    const rolesBox = document.getElementById("roles");
    const table = document.getElementById("matchTable");
    const tbody = document.getElementById("matchBody");
    const loading = document.getElementById("loading");

    let CN = null;
    try {
        const cnRes = await fetch("/assets/cn.json");
        CN = await cnRes.json();
    } catch (e) {
        console.error("cn.json 加载失败", e);
        CN = {};
    }

    const getFactionBadge = (faction) => {
        const f = String(faction).trim();
        if (f === "1") return '<span class="faction-goose">鹅</span>';
        if (f === "2") return '<span class="faction-duck">鸭</span>';
        if (f === "3") return '<span class="faction-neutral">中立</span>';
        return `<span class="faction-neutral">${faction || '未知'}</span>`;
    };

    const getKeyByIndex = (obj, index) => {
        const keys = Object.keys(obj || {});
        return keys[index] || "NONE";
    };

    const getRoleName = (role) => {
        if (!CN?.ROLES) return role;
        const key = typeof role === "number" ? getKeyByIndex(CN.ROLES, role) : role;
        return CN.ROLES[key] || key;
    };

    const getModeName = (mode) => {
        if (!CN?.GAME_MODES) return mode;
        const key = typeof mode === "number" ? getKeyByIndex(CN.GAME_MODES, mode) : mode;
        return CN.GAME_MODES[key] || key;
    };

    const getMapName = (map) => {
        if (!CN?.MAPS) return map;
        const key = typeof map === "number" ? getKeyByIndex(CN.MAPS, map) : map;
        return CN.MAPS[key] || key;
    };

    // ==========================================
    // 核心修改：精准匹配你指定的 Query 路由跳转
    // ==========================================
    window.viewMatchDetail = (matchId) => {
        if (!matchId) return;
        window.location.href = `?page=match-details&matchId=${matchId}`;
    };

    try {
        const res = await fetch("/api/getMatches.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const json = await res.json();
        if (!json.success) {
            loading.innerText = "加载失败";
            return;
        }

        const body = json.data.body;

        // ================= KPI =================
        kpiBox.innerHTML = `
            <div class="card">胜率 <strong>${body.winRate}%</strong></div>
            <div class="card">投票 <strong>${body.votingAccuracy}%</strong></div>
            <div class="card">存活 <strong>${body.turnsSurvived}</strong></div>
            <div class="card">击杀 <strong>${body.kills}</strong></div>
        `;

        // ================= roles =================
        let roleHtml = '';
        for (let r in body.rolesBreakdown) {
            const item = body.rolesBreakdown[r];
            roleHtml += `
                <div class="card">
                    <strong>${getRoleName(r)}</strong>
                    <div>场次 ${item.timesPlayed}</div>
                    <div>胜率 ${item.winRate}%</div>
                </div>
            `;
        }
        rolesBox.innerHTML = roleHtml;

        // ================= matches =================
        tbody.innerHTML = "";
        body.latestMatches.forEach((m, i) => {
            tbody.innerHTML += `
                <tr>
                    <td data-label="序号">${i + 1}</td>
                    <td data-label="阵营">${getFactionBadge(m.faction)}</td>
                    <td data-label="角色">${getRoleName(m.role)}</td>
                    <td data-label="地图">${getMapName(m.map)}</td>
                    <td data-label="模式">${getModeName(m.mode)}</td>
                    <td data-label="结果">${m.win ? '<span class="tag-win">WIN</span>' : '<span class="tag-loss">LOSE</span>'}</td>
                    <td data-label="存活">${m.turnsSurvived} 轮</td>
                    <td data-label="击杀">${m.kills} 杀</td>
                    <td data-label="投票">${m.votingAccuracy}%</td>
                    <td data-label="时间">${m.startAt.slice(5,16)}</td> 
                    <td data-label="操作">
                        <!-- 传入动态的 m.matchId -->
                        <button class="btn-detail" onclick="viewMatchDetail('${m.matchId}')">查看对局详情</button>
                    </td>
                </tr>
            `;
        });

        loading.style.display = "none";
        table.style.display = window.innerWidth >= 768 ? "table" : "block";

    } catch (e) {
        loading.innerText = "网络错误";
        console.error(e);
    }
});
</script>