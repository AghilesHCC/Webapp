<?php
/**
 * API: Statistiques administrateur
 * GET /api/admin/stats.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::requireAdmin();

    $db = Database::getInstance()->getConnection();

    // Nombre total d'utilisateurs
    $query = "SELECT COUNT(*) as total FROM users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];

    // Nombre d'utilisateurs actifs
    $query = "SELECT COUNT(*) as total FROM users WHERE statut = 'actif'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $activeUsers = $stmt->fetch()['total'];

    // Nombre de réservations ce mois
    $query = "SELECT COUNT(*) as total FROM reservations
              WHERE MONTH(created_at) = MONTH(NOW())
              AND YEAR(created_at) = YEAR(NOW())";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $monthReservations = $stmt->fetch()['total'];

    // Nombre de réservations aujourd'hui
    $query = "SELECT COUNT(*) as total FROM reservations
              WHERE DATE(created_at) = CURDATE()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $todayReservations = $stmt->fetch()['total'];

    // Revenu total ce mois
    $query = "SELECT COALESCE(SUM(montant_total - COALESCE(reduction, 0)), 0) as total FROM reservations
              WHERE MONTH(created_at) = MONTH(NOW())
              AND YEAR(created_at) = YEAR(NOW())
              AND statut IN ('confirmee', 'terminee')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $monthRevenue = $stmt->fetch()['total'];

    // Revenu mois précédent pour calculer la croissance
    $query = "SELECT COALESCE(SUM(montant_total - COALESCE(reduction, 0)), 0) as total FROM reservations
              WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
              AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
              AND statut IN ('confirmee', 'terminee')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $lastMonthRevenue = $stmt->fetch()['total'];

    $revenueGrowth = $lastMonthRevenue > 0 ? round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1) : 0;

    // Nombre d'abonnements actifs
    $query = "SELECT COUNT(*) as total FROM abonnements_utilisateurs
              WHERE statut = 'actif'
              AND date_fin > NOW()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $activeSubscriptions = $stmt->fetch()['total'];

    // Utilisateurs actifs mois précédent pour calculer la croissance
    $query = "SELECT COUNT(*) as total FROM users
              WHERE statut = 'actif'
              AND created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $lastMonthActiveUsers = $stmt->fetch()['total'];

    $usersGrowth = $lastMonthActiveUsers > 0 ? round((($activeUsers - $lastMonthActiveUsers) / $lastMonthActiveUsers) * 100, 1) : 0;

    // Nombre de demandes de domiciliation en attente
    $query = "SELECT COUNT(*) as total FROM domiciliations
              WHERE statut = 'en_attente'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $pendingDomiciliations = $stmt->fetch()['total'];

    // Taux d'occupation des espaces aujourd'hui
    $query = "SELECT COUNT(DISTINCT espace_id) as total FROM reservations
              WHERE DATE(date_debut) <= CURDATE()
              AND DATE(date_fin) >= CURDATE()
              AND statut IN ('confirmee', 'en_cours')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $occupiedSpaces = $stmt->fetch()['total'];

    $query = "SELECT COUNT(*) as total FROM espaces";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalSpaces = $stmt->fetch()['total'];

    $occupancyRate = $totalSpaces > 0 ? round(($occupiedSpaces / $totalSpaces) * 100, 2) : 0;

    // Taux d'occupation mois précédent
    $query = "SELECT COUNT(DISTINCT espace_id) as total FROM reservations
              WHERE DATE(date_debut) <= LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH))
              AND DATE(date_fin) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
              AND statut IN ('confirmee', 'en_cours', 'terminee')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $lastMonthOccupiedSpaces = $stmt->fetch()['total'];

    $lastMonthOccupancyRate = $totalSpaces > 0 ? round(($lastMonthOccupiedSpaces / $totalSpaces) * 100, 2) : 0;
    $occupancyGrowth = $lastMonthOccupancyRate > 0 ? round($occupancyRate - $lastMonthOccupancyRate, 1) : 0;

    // Réservations hier pour calculer la croissance
    $query = "SELECT COUNT(*) as total FROM reservations
              WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $yesterdayReservations = $stmt->fetch()['total'];

    $reservationsGrowth = $yesterdayReservations > 0 ? (int)($todayReservations - $yesterdayReservations) : $todayReservations;

    // Calculer le revenu total (toutes périodes)
    $query = "SELECT COALESCE(SUM(montant_total - COALESCE(reduction, 0)), 0) as total FROM reservations
              WHERE statut IN ('confirmee', 'terminee')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalRevenue = $stmt->fetch()['total'];

    // Compter toutes les réservations
    $query = "SELECT COUNT(*) as total FROM reservations";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalReservationsCount = $stmt->fetch()['total'];

    // Espaces populaires
    $query = "SELECT e.nom as name, COUNT(r.id) as count
              FROM reservations r
              JOIN espaces e ON r.espace_id = e.id
              WHERE MONTH(r.created_at) = MONTH(NOW())
              AND YEAR(r.created_at) = YEAR(NOW())
              GROUP BY e.id, e.nom
              ORDER BY count DESC
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $popularSpaces = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success([
        // Format attendu par le frontend
        'totalUsers' => (int)$totalUsers,
        'activeUsers' => (int)$activeUsers,
        'totalReservations' => (int)$totalReservationsCount,
        'monthlyRevenue' => (float)$monthRevenue,
        'totalRevenue' => (float)$totalRevenue,
        'occupancyRate' => $occupancyRate,
        'tauxOccupation' => $occupancyRate,
        'caMois' => (float)$monthRevenue,
        'reservationsCeMois' => (int)$monthReservations,
        'popularSpaces' => $popularSpaces,
        'recentActivity' => [],

        // Format détaillé pour compatibilité
        'users' => [
            'total' => (int)$totalUsers,
            'active' => (int)$activeUsers,
            'growth' => $usersGrowth
        ],
        'reservations' => [
            'today' => (int)$todayReservations,
            'month' => (int)$monthReservations,
            'growth' => $reservationsGrowth
        ],
        'revenue' => [
            'month' => (float)$monthRevenue,
            'total' => (float)$totalRevenue,
            'growth' => $revenueGrowth
        ],
        'subscriptions' => [
            'active' => (int)$activeSubscriptions
        ],
        'domiciliations' => [
            'pending' => (int)$pendingDomiciliations
        ],
        'occupancy' => [
            'rate' => $occupancyRate,
            'occupied' => (int)$occupiedSpaces,
            'total' => (int)$totalSpaces,
            'growth' => $occupancyGrowth
        ]
    ]);

} catch (Exception $e) {
    error_log("Get admin stats error: " . $e->getMessage());
    Response::serverError();
}
?>
