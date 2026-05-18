<?php


const CONFIG_FILE = __DIR__ . '/link.json';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function reply($obj, $code = 200) {
    http_response_code($code);
    echo json_encode($obj, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readConfig() {
    if (!file_exists(CONFIG_FILE)) {
        return ['enabled' => true, 'redirects' => new stdClass()];
    }
    $cfg = json_decode(file_get_contents(CONFIG_FILE), true);
    if (!is_array($cfg)) return ['enabled' => true, 'redirects' => new stdClass()];
    if (!isset($cfg['redirects']) || !is_array($cfg['redirects'])) $cfg['redirects'] = [];
    if (!isset($cfg['enabled'])) $cfg['enabled'] = true;
    return $cfg;
}

function writeConfig($cfg) {
    $fp = fopen(CONFIG_FILE, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp); flock($fp, LOCK_UN); fclose($fp);
    return true;
}

$action = $_GET['action'] ?? 'get';

if ($action === 'get') {
    $cfg = readConfig();
    if (is_array($cfg['redirects']) && count($cfg['redirects']) === 0) {
        $cfg['redirects'] = new stdClass();
    }
    reply($cfg);
}

if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $key    = trim((string)($body['key'] ?? ''));
    $domain = trim((string)($body['domain'] ?? ''));
    if ($key === '' || $domain === '') reply(['ok' => false, 'error' => 'missing key or domain'], 400);

    $cfg = readConfig();
    if (!is_array($cfg['redirects'])) $cfg['redirects'] = [];
    $cfg['redirects'][$key] = $domain;
    if (!writeConfig($cfg)) reply(['ok' => false, 'error' => 'cannot write config'], 500);
    reply(['ok' => true, 'key' => $key, 'domain' => $domain]);
}

if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $key  = trim((string)($body['key'] ?? ''));
    if ($key === '') reply(['ok' => false, 'error' => 'missing key'], 400);

    $cfg = readConfig();
    if (isset($cfg['redirects'][$key])) {
        unset($cfg['redirects'][$key]);
        if (!writeConfig($cfg)) reply(['ok' => false, 'error' => 'cannot write config'], 500);
    }
    reply(['ok' => true]);
}

reply(['ok' => false, 'error' => 'unknown action'], 400);
