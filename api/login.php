<?php
session_start();
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

if (!$email || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "邮箱或密码不能为空"
    ]);
    exit;
}

function firebase_login(string $email, string $password): array
{
    $url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC-CT-cyhvSzpP95UeYA9yNs-pqXMek_jg";

    $payload = json_encode([
        "returnSecureToken" => true,
        "email" => $email,
        "password" => $password
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

        // ========= 代理 =========
        CURLOPT_PROXY => "127.0.0.1:20171",
        CURLOPT_PROXYTYPE => CURLPROXY_HTTP,

        // ========= 超时 =========
        CURLOPT_TIMEOUT => 45,
        CURLOPT_CONNECTTIMEOUT => 30,

        // ========= SSL =========
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

$res = firebase_login($email, $password);

if ($res["success"] === true) {
    $_SESSION["username"] = $res["data"]["email"];
    $_SESSION["idToken"] = $res["data"]["idToken"];
    $_SESSION["uid"] = $res["data"]["localId"];
}

echo json_encode($res);
