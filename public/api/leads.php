<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
  exit;
}

$name = trim((string)($data['name'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$chatName = trim((string)($data['chat_name'] ?? ''));
$chatLink = trim((string)($data['chat_link'] ?? ''));

if ($name === '' || $phone === '' || $chatName === '' || $chatLink === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
  exit;
}

$payload = [
  'name' => $name,
  'phone' => $phone,
  'telegram' => trim((string)($data['telegram'] ?? '')),
  'company' => trim((string)($data['company'] ?? '')),
  'businessType' => trim((string)($data['businessType'] ?? '')),
  'comment' => trim((string)($data['comment'] ?? '')),
  'chat_name' => $chatName,
  'chat_link' => $chatLink,
  'catalog_group' => trim((string)($data['catalog_group'] ?? '')),
  'region' => trim((string)($data['region'] ?? '')),
  'city_cluster' => trim((string)($data['city_cluster'] ?? '')),
  'district' => trim((string)($data['district'] ?? '')),
  'createdAt' => gmdate('c'),
  'source' => 'php-static-endpoint'
];

$filePath = dirname(__DIR__) . '/data/leads.json';

if (!file_exists($filePath)) {
  if (!is_dir(dirname($filePath))) {
    mkdir(dirname($filePath), 0775, true);
  }
  file_put_contents($filePath, "[]\n");
}

$current = json_decode((string)file_get_contents($filePath), true);
if (!is_array($current)) {
  $current = [];
}

$current[] = $payload;

$encoded = json_encode($current, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($encoded === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Encoding error']);
  exit;
}

$writeResult = file_put_contents($filePath, $encoded . "\n", LOCK_EX);
if ($writeResult === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Cannot write file']);
  exit;
}

echo json_encode(['ok' => true]);
