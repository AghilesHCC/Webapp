<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$results = [];
$startTime = microtime(true);

function addResult(&$results, $category, $name, $status, $message, $details = null) {
    $results[] = [
        'category' => $category,
        'name' => $name,
        'status' => $status,
        'message' => $message,
        'details' => $details
    ];
}

addResult($results, 'PHP', 'PHP Version',
    version_compare(PHP_VERSION, '7.4.0', '>=') ? 'pass' : 'fail',
    'PHP ' . PHP_VERSION,
    version_compare(PHP_VERSION, '8.0.0', '>=') ? 'PHP 8+ recommended' : null
);

$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
foreach ($requiredExtensions as $ext) {
    addResult($results, 'PHP Extensions', $ext,
        extension_loaded($ext) ? 'pass' : 'fail',
        extension_loaded($ext) ? 'Loaded' : 'Not loaded'
    );
}

$configFile = __DIR__ . '/config/database.php';
addResult($results, 'Configuration', 'Database config file',
    file_exists($configFile) ? 'pass' : 'fail',
    file_exists($configFile) ? 'Found' : 'Not found'
);

$envFile = __DIR__ . '/../.env';
addResult($results, 'Configuration', 'Environment file',
    file_exists($envFile) ? 'pass' : 'warning',
    file_exists($envFile) ? 'Found' : 'Not found (using defaults)'
);

try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::getInstance()->getConnection();
    addResult($results, 'Database', 'Connection', 'pass', 'Connected successfully');

    $tables = ['users', 'espaces', 'reservations', 'codes_promo', 'abonnements', 'domiciliations', 'notifications', 'parrainages'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            addResult($results, 'Database Tables', $table, 'pass', "Found ($count rows)");
        } catch (Exception $e) {
            addResult($results, 'Database Tables', $table, 'fail', 'Table not found or error', $e->getMessage());
        }
    }

    $requiredColumns = [
        'espaces' => ['id', 'nom', 'type', 'capacite', 'prix_heure', 'prix_demi_journee', 'prix_jour', 'prix_semaine', 'disponible', 'description', 'equipements'],
        'reservations' => ['id', 'user_id', 'espace_id', 'date_debut', 'date_fin', 'statut', 'type_reservation', 'montant_total', 'participants'],
        'users' => ['id', 'email', 'password_hash', 'nom', 'prenom', 'role', 'statut'],
        'codes_promo' => ['id', 'code', 'type', 'valeur', 'date_debut', 'date_fin', 'utilisations_max', 'utilisations_actuelles', 'montant_min', 'actif']
    ];

    foreach ($requiredColumns as $table => $columns) {
        try {
            $stmt = $db->query("DESCRIBE $table");
            $existingColumns = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');

            $missingColumns = array_diff($columns, $existingColumns);

            if (empty($missingColumns)) {
                addResult($results, 'Schema Validation', "$table columns", 'pass', 'All required columns present');
            } else {
                addResult($results, 'Schema Validation', "$table columns", 'fail',
                    'Missing columns: ' . implode(', ', $missingColumns));
            }
        } catch (Exception $e) {
            addResult($results, 'Schema Validation', "$table columns", 'fail', 'Could not check', $e->getMessage());
        }
    }

    try {
        $stmt = $db->query("SELECT * FROM espaces WHERE type = 'open_space' LIMIT 1");
        $coworking = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($coworking) {
            $capacite = (int)$coworking['capacite'];
            addResult($results, 'Coworking Space', 'Configuration', 'pass',
                "Found: {$coworking['nom']} with capacity of $capacite seats");

            $stmt = $db->prepare("
                SELECT COUNT(*) as active_reservations,
                       COALESCE(SUM(participants), 0) as total_participants
                FROM reservations
                WHERE espace_id = :espace_id
                AND statut IN ('confirmee', 'en_cours')
                AND date_debut <= NOW()
                AND date_fin >= NOW()
            ");
            $stmt->execute([':espace_id' => $coworking['id']]);
            $currentReservations = $stmt->fetch(PDO::FETCH_ASSOC);

            $occupiedSeats = (int)$currentReservations['total_participants'];
            $availableSeats = $capacite - $occupiedSeats;

            addResult($results, 'Coworking Space', 'Current availability', 'pass',
                "$availableSeats of $capacite seats available",
                "Active reservations: {$currentReservations['active_reservations']}"
            );
        } else {
            addResult($results, 'Coworking Space', 'Configuration', 'warning', 'No open_space type found');
        }
    } catch (Exception $e) {
        addResult($results, 'Coworking Space', 'Check', 'fail', 'Error checking coworking space', $e->getMessage());
    }

    try {
        $stmt = $db->query("
            SELECT
                (SELECT COUNT(*) FROM reservations WHERE statut = 'confirmee') as confirmed,
                (SELECT COUNT(*) FROM reservations WHERE statut = 'en_attente') as pending,
                (SELECT COUNT(*) FROM reservations WHERE statut = 'annulee') as cancelled,
                (SELECT COUNT(*) FROM reservations WHERE statut = 'terminee') as completed
        ");
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        addResult($results, 'Reservations', 'Statistics', 'pass',
            "Confirmed: {$stats['confirmed']}, Pending: {$stats['pending']}, Cancelled: {$stats['cancelled']}, Completed: {$stats['completed']}"
        );
    } catch (Exception $e) {
        addResult($results, 'Reservations', 'Statistics', 'fail', 'Could not fetch stats', $e->getMessage());
    }

} catch (Exception $e) {
    addResult($results, 'Database', 'Connection', 'fail', 'Connection failed', $e->getMessage());
}

$apiEndpoints = [
    '/api/espaces/index.php' => 'Espaces list',
    '/api/abonnements/index.php' => 'Abonnements list',
    '/api/codes-promo/public.php' => 'Public promo codes',
];

foreach ($apiEndpoints as $path => $name) {
    $fullPath = __DIR__ . str_replace('/api', '', $path);
    addResult($results, 'API Endpoints', $name,
        file_exists($fullPath) ? 'pass' : 'fail',
        file_exists($fullPath) ? 'File exists' : 'File not found'
    );
}

$utilFiles = [
    'Auth.php' => 'Authentication utility',
    'Response.php' => 'Response helper',
    'Validator.php' => 'Validation utility',
    'Pagination.php' => 'Pagination utility',
];

foreach ($utilFiles as $file => $name) {
    $fullPath = __DIR__ . '/utils/' . $file;
    addResult($results, 'Utilities', $name,
        file_exists($fullPath) ? 'pass' : 'fail',
        file_exists($fullPath) ? 'Found' : 'Not found'
    );
}

$writableDirs = [
    sys_get_temp_dir() => 'System temp directory',
];

foreach ($writableDirs as $dir => $name) {
    addResult($results, 'Permissions', $name,
        is_writable($dir) ? 'pass' : 'fail',
        is_writable($dir) ? 'Writable' : 'Not writable'
    );
}

addResult($results, 'Server', 'Server software',
    'pass',
    $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
);

addResult($results, 'Server', 'Request method',
    'pass',
    $_SERVER['REQUEST_METHOD']
);

addResult($results, 'Server', 'Memory limit',
    'pass',
    ini_get('memory_limit')
);

addResult($results, 'Server', 'Max execution time',
    'pass',
    ini_get('max_execution_time') . ' seconds'
);

$testDate = '2024-01-15T10:30:00Z';
$parsed = strtotime($testDate);
addResult($results, 'Date Handling', 'ISO 8601 parsing',
    $parsed !== false ? 'pass' : 'fail',
    $parsed !== false ? date('Y-m-d H:i:s', $parsed) : 'Failed to parse'
);

$testDate2 = '2024-01-15 10:30:00';
$parsed2 = strtotime($testDate2);
addResult($results, 'Date Handling', 'MySQL datetime parsing',
    $parsed2 !== false ? 'pass' : 'fail',
    $parsed2 !== false ? date('Y-m-d H:i:s', $parsed2) : 'Failed to parse'
);

addResult($results, 'Date Handling', 'Timezone',
    'pass',
    date_default_timezone_get()
);

$testJson = '{"equipements": ["WiFi", "Climatisation", "Cafe"]}';
$decoded = json_decode($testJson, true);
addResult($results, 'JSON Handling', 'JSON decode',
    $decoded !== null ? 'pass' : 'fail',
    $decoded !== null ? 'Success' : json_last_error_msg()
);

$testArray = ['test' => 'value', 'number' => 123, 'nested' => ['a' => 1]];
$encoded = json_encode($testArray);
addResult($results, 'JSON Handling', 'JSON encode',
    $encoded !== false ? 'pass' : 'fail',
    $encoded !== false ? 'Success' : json_last_error_msg()
);

$executionTime = (microtime(true) - $startTime) * 1000;

$summary = [
    'total' => count($results),
    'passed' => count(array_filter($results, fn($r) => $r['status'] === 'pass')),
    'failed' => count(array_filter($results, fn($r) => $r['status'] === 'fail')),
    'warnings' => count(array_filter($results, fn($r) => $r['status'] === 'warning')),
];

$report = [
    'success' => true,
    'timestamp' => date('c'),
    'executionTime' => round($executionTime, 2) . 'ms',
    'environment' => [
        'php_version' => PHP_VERSION,
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'timezone' => date_default_timezone_get()
    ],
    'summary' => $summary,
    'results' => $results
];

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
