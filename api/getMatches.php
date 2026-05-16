<?php

session_start();
header("Content-Type: application/json");

// 1. 获取 token
$idToken = $_SESSION["idToken"] ?? "";

if (!$idToken) {
    echo json_encode([
        "success" => false,
        "message" => "未登录或缺少 token"
    ]);
    exit;
}

$uid = $_SESSION["uid"] ?? "";

if (!$uid) {
    echo json_encode([
        "success" => false,
        "message" => "缺少 uid"
    ]);
    exit;
}

// 3. API 请求函数
function fetch_player_match_list(string $idToken, string $uid): array
{
    $url = "https://us-central1-gaggle-staging.cloudfunctions.net/ggdPlayerMatch?action=FetchList";

    $payload = json_encode([
        "uid" => $uid
    ]);

    $headers = [
        "accept: application/json, text/plain, */*",
        "content-type: application/json",
        "authorization: Bearer " . $idToken,
        "origin: https://gaggle.fun",
        "referer: https://gaggle.fun/",
        "cache-control: no-cache",
        "pragma: no-cache",
        "user-agent: Mozilla/5.0"
    ];

    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,

        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,

        CURLOPT_HTTPHEADER => $headers,

        // ===== 代理（如果你本地需要）=====
        CURLOPT_PROXY => "127.0.0.1:20171",
        CURLOPT_PROXYTYPE => CURLPROXY_HTTP,

        // ===== 超时 =====
        CURLOPT_TIMEOUT => 45,
        CURLOPT_CONNECTTIMEOUT => 30,

        // ===== SSL =====
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        return [
            "success" => false,
            "error" => curl_error($ch)
        ];
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        "success" => $httpCode === 200,
        "http_code" => $httpCode,
        "data" => json_decode($response, true)
    ];
}

// 4. 执行请求
$res = fetch_player_match_list($idToken, $uid);

// 5. 输出
echo json_encode($res);