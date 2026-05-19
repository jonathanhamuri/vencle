<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

$honeypot = $_POST['website'] ?? '';
if ($honeypot !== '') {
    echo json_encode(['success' => true, 'message' => 'Message sent.']);
    exit;
}

function sanitize($value) {
    return trim(htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8'));
}

$name = sanitize($_POST['name'] ?? '');
$phone = sanitize($_POST['phone'] ?? '');
$email = sanitize($_POST['email'] ?? '');
$service = sanitize($_POST['service'] ?? 'Not specified');
$message = sanitize($_POST['message'] ?? '');

$errors = [];

if (strlen($name) < 2) {
    $errors[] = 'Please enter your name.';
}

$phoneClean = preg_replace('/[\s\-()]/', '', $phone);
if (strlen($phoneClean) < 9 || !preg_match('/^[+0-9]{9,20}$/', $phoneClean)) {
    $errors[] = 'Please enter a valid phone number.';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (strlen($message) < 10) {
    $errors[] = 'Please enter a message with at least 10 characters.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

$to = 'veclet@outlook.com';
$subject = 'New enquiry from V Repairs website';
$body = "A new message was submitted from the website:\n\n" .
        "Name: {$name}\n" .
        "Phone: {$phone}\n" .
        "Email: {$email}\n" .
        "Service: {$service}\n\n" .
        "Message:\n{$message}\n";

$headers = [];
$headers[] = 'From: V Repairs Website <noreply@vrepairs.co.za>';
if ($email !== '') {
    $headers[] = "Reply-To: {$email}";
}
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Thanks! We’ll power up a response shortly ⚡']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email delivery failed. Please call +27 78 547 8424.']);
}
exit;
?>
