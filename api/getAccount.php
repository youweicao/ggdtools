<?php

session_start();
header("Content-Type: application/json");

$idToken = $_SESSION["token"] ?? "";

$data = json_decode(file_get_contents("php://input"), true);
if (!$idToken && isset($data["idToken"])) {
    $idToken = $data["idToken"];
}

if (!$idToken) {
    echo json_encode([
        "success" => false,
        "message" => "未登录或缺少 token"
    ]);
    exit;
}

function firebase_get_user_info(string $idToken): array
{
    $url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyC-CT-cyhvSzpP95UeYA9yNs-pqXMek_jg";

    $payload = json_encode([
        "idToken" => $idToken
    ]);

    $headers = [
        "content-type: application/json",
        "origin: https://gaggle.fun",
        "x-client-version: Chrome/JsCore/9.17.2/FirebaseCore-web",
        "x-firebase-gmpid: 1:771149490703:web:b92da74121911256af517a"
    ];

    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,

        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,

        CURLOPT_HTTPHEADER => $headers,

        // ===== 代理（和你登录接口保持一致）=====
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

    $data = json_decode($response, true);

    return [
        "success" => $httpCode === 200,
        "http_code" => $httpCode,
        "data" => $data
    ];
}

$res = firebase_get_user_info($idToken);

// 更新 session 信息
// 这里暂时不更新其他session了，怕信息覆盖。所有的请求全部读session中的idtoken重新发送
// 这里的api不知道为什么要调用，因为登录api已经能返回uid了
if ($res["success"] === true && isset($res["data"]["users"][0])) {

}

echo json_encode($res);