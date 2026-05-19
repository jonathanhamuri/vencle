<?php
/**
 * V Repairs (Pty) Ltd — Contact Form Handler
 * ============================================
 * File: contact.php
 * 
 * Receives POST submissions from the contact form,
 * validates input, applies basic rate-limiting,
 * and sends an email to veclet@outlook.com.
 * 
 * Requirements:
 *   - PHP 7.4+ with mail() configured, OR
 *   - PHPMailer (recommended for SMTP reliability).
 * 
 * To use PHPMailer (recommended for shared hosting):
 *   1. Download PHPMailer: https://github.com/PHPMailer/PHPMailer
 *   2. Place the /src/ folder next to this file.
 *   3. Uncomment the PHPMailer section below.
 */

/* ── Security headers ──────────────────────────────────────── */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

/* Only accept POST + AJAX requests */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if (empty($_SERVER['HTTP_X_REQUESTED_WITH']) ||
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

/* ── Basic rate limiting (session-based) ───────────────────── */
session_start();
$now        = time();
$limit      = 5;           /* max submissions */
$window     = 3600;        /* per hour */

if (!isset($_SESSION['vr_submissions'])) {
    $_SESSION['vr_submissions'] = [];
}

/* Remove entries older than the window */
$_SESSION['vr_submissions'] = array_filter(
    $_SESSION['vr_submissions'],
    fn($t) => ($now - $t) < $window
);

if (count($_SESSION['vr_submissions']) >= $limit) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Too many submissions. Please try again later or call us directly.'
    ]);
    exit;
}

/* ── Sanitise & validate input ─────────────────────────────── */
function sanitise(string $val): string {
    return htmlspecialchars(trim(strip_tags($val)), ENT_QUOTES, 'UTF-8');
}

$name    = sanitise($_POST['name']    ?? '');
$phone   = sanitise($_POST['phone']   ?? '');
$email   = sanitise($_POST['email']   ?? '');
$service = sanitise($_POST['service'] ?? '');
$message = sanitise($_POST['message'] ?? '');
$honey   = $_POST['website'] ?? ''; /* honeypot field */

/* Honeypot check — bots fill hidden fields */
if (!empty($honey)) {
    /* Pretend success to confuse bots */
    echo json_encode(['success' => true, 'message' => 'Message sent!']);
    exit;
}

/* Required field checks */
$errors = [];

if (strlen($name) < 2) {
    $errors[] = 'Name is required (minimum 2 characters).';
}

$cleanPhone = preg_replace('/[\s\-\(\)]/', '', $phone);
if (strlen($cleanPhone) < 9 || !preg_match('/^[+0-9]{9,15}$/', $cleanPhone)) {
    $errors[] = 'A valid phone number is required.';
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email address is not valid.';
}

if (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ── Build email ───────────────────────────────────────────── */
$to      = 'veclet@outlook.com';
$subject = 'New Enquiry from V Repairs Website' . ($name ? ' — ' . $name : '');

$serviceLabel = $service ?: 'Not specified';

$body = <<<EOT
You have received a new enquiry from your website.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name:     {$name}
  Phone:    {$phone}
  Email:    {$email}
  Service:  {$serviceLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message:
{$message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent via V Repairs website contact form
EOT;

/* ── Option A: PHP mail() (works on most shared hosting) ───── */
$headers  = "From: V Repairs Website <noreply@vrepairs.co.za>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$sent = mail($to, $subject, $body, $headers);

/* ── Option B: PHPMailer via SMTP (recommended) ─────────────
 * Uncomment this block and comment out Option A above.
 * Set your SMTP credentials below.
 * 
 * require 'src/PHPMailer.php';
 * require 'src/SMTP.php';
 * require 'src/Exception.php';
 * 
 * use PHPMailer\PHPMailer\PHPMailer;
 * use PHPMailer\PHPMailer\Exception;
 * 
 * $mail = new PHPMailer(true);
 * try {
 *     $mail->isSMTP();
 *     $mail->Host       = 'smtp.office365.com'; // or your SMTP host
 *     $mail->SMTPAuth   = true;
 *     $mail->Username   = 'veclet@outlook.com';
 *     $mail->Password   = 'YOUR_EMAIL_PASSWORD';
 *     $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
 *     $mail->Port       = 587;
 *     $mail->setFrom('veclet@outlook.com', 'V Repairs Website');
 *     $mail->addAddress('veclet@outlook.com', 'V Repairs');
 *     if ($email) $mail->addReplyTo($email, $name);
 *     $mail->Subject = $subject;
 *     $mail->Body    = $body;
 *     $mail->send();
 *     $sent = true;
 * } catch (Exception $e) {
 *     error_log('Mailer Error: ' . $mail->ErrorInfo);
 *     $sent = false;
 * }
 ─────────────────────────────────────── */

/* ── Respond to client ─────────────────────────────────────── */
if ($sent) {
    /* Record this submission for rate limiting */
    $_SESSION['vr_submissions'][] = $now;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Thanks! We'll power up a response shortly ⚡"
    ]);
} else {
    error_log("V Repairs: mail() failed for submission from {$name} ({$phone})");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Email could not be sent. Please call us directly on +27 78 547 8424.'
    ]);
}
exit;
