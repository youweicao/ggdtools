<?php

session_start();
header("Content-Type: application/json");

$idToken = $_SESSION["idToken"] ?? null;

if (!$idToken) {
    echo json_encode([
        "success" => false,
        "message" => "未登录或 token 失效"
    ]);
    exit;
}

$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true);

// 3. 拿到前端从当前页面抓到的 matchId
$matchId = $inputData['matchId'] ?? '';

if (!$matchId) {
    echo json_encode(["success" => false, "message" => "缺少 matchId"]);
    exit;
}

function fetch_match_timeline(string $matchId): array
{
    $url = "https://ggdmatchdata.gaggle.fun/match-timelines/{$matchId}.json";

    $headers = [
        "accept: application/json, text/plain, */*",
        "cache-control: no-cache",
        "pragma: no-cache",
        "origin: https://gaggle.fun",
        "referer: https://gaggle.fun/",
        "user-agent: Mozilla/5.0"
    ];

    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,

        CURLOPT_PROXY => "127.0.0.1:20171",
        CURLOPT_PROXYTYPE => CURLPROXY_HTTP,

        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 15,

        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        return [
            "success" => false,
            "message" => curl_error($ch)
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

$res = fetch_match_timeline($matchId);

echo json_encode($res);