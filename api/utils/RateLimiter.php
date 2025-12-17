<?php
/**
 * Rate Limiter simple basé sur fichiers
 * Protège contre les attaques brute force
 */

class RateLimiter {
    private static $cacheDir = __DIR__ . '/../.cache/ratelimit/';
    private $identifier;
    private $maxAttempts;
    private $decayMinutes;

    public function __construct($identifier = null, $maxAttempts = 60, $decayMinutes = 1) {
        $this->identifier = $identifier ?? self::getClientIp();
        $this->maxAttempts = $maxAttempts;
        $this->decayMinutes = $decayMinutes;
    }

    /**
     * Verifier la limite (methode d'instance) - alias pour tooManyAttempts
     */
    public function checkLimit($action = '') {
        $key = $this->identifier . ':' . $action;
        if (self::tooManyAttempts($key, $this->maxAttempts, $this->decayMinutes)) {
            require_once __DIR__ . '/Response.php';
            Response::error("Trop de tentatives. Réessayez plus tard.", 429);
        }
        self::hit($key);
    }

    /**
     * Obtenir l'IP du client
     */
    private static function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        }
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Vérifie si une IP a dépassé la limite de requêtes
     * @param string $identifier Identifiant unique (IP, user_id, etc.)
     * @param int $maxAttempts Nombre maximum de tentatives
     * @param int $decayMinutes Durée en minutes avant reset
     * @return bool True si limite dépassée
     */
    public static function tooManyAttempts($identifier, $maxAttempts = 60, $decayMinutes = 1) {
        $key = self::getKey($identifier);
        $data = self::getData($key);

        $now = time();
        $windowStart = $now - ($decayMinutes * 60);

        // Nettoyer les anciennes tentatives
        $data['attempts'] = array_filter($data['attempts'], function($timestamp) use ($windowStart) {
            return $timestamp > $windowStart;
        });

        return count($data['attempts']) >= $maxAttempts;
    }

    /**
     * Enregistre une tentative
     */
    public static function hit($identifier) {
        $key = self::getKey($identifier);
        $data = self::getData($key);

        $data['attempts'][] = time();
        self::saveData($key, $data);
    }

    /**
     * Reset le compteur
     */
    public static function clear($identifier) {
        $key = self::getKey($identifier);
        $file = self::$cacheDir . $key;
        if (file_exists($file)) {
            unlink($file);
        }
    }

    /**
     * Obtenir le nombre de tentatives restantes
     */
    public static function retriesLeft($identifier, $maxAttempts = 60, $decayMinutes = 1) {
        $key = self::getKey($identifier);
        $data = self::getData($key);

        $now = time();
        $windowStart = $now - ($decayMinutes * 60);

        $data['attempts'] = array_filter($data['attempts'], function($timestamp) use ($windowStart) {
            return $timestamp > $windowStart;
        });

        return max(0, $maxAttempts - count($data['attempts']));
    }

    /**
     * Obtenir le temps avant le prochain essai
     */
    public static function availableIn($identifier, $decayMinutes = 1) {
        $key = self::getKey($identifier);
        $data = self::getData($key);

        if (empty($data['attempts'])) {
            return 0;
        }

        $oldestAttempt = min($data['attempts']);
        $expiresAt = $oldestAttempt + ($decayMinutes * 60);

        return max(0, $expiresAt - time());
    }

    // Méthodes privées

    private static function getKey($identifier) {
        return md5($identifier);
    }

    private static function getData($key) {
        if (!self::ensureCacheDir()) {
            return ['attempts' => []];
        }

        $file = self::$cacheDir . $key;

        if (file_exists($file)) {
            try {
                $content = @file_get_contents($file);
                $data = json_decode($content, true);
                if ($data) {
                    return $data;
                }
            } catch (Exception $e) {
                error_log("RateLimiter: Cannot read cache file: " . $e->getMessage());
            }
        }

        return ['attempts' => []];
    }

    private static function saveData($key, $data) {
        if (!self::ensureCacheDir()) {
            return false;
        }

        $file = self::$cacheDir . $key;
        try {
            @file_put_contents($file, json_encode($data));
            return true;
        } catch (Exception $e) {
            error_log("RateLimiter: Cannot write cache file: " . $e->getMessage());
            return false;
        }
    }

    private static function ensureCacheDir() {
        if (!is_dir(self::$cacheDir)) {
            try {
                @mkdir(self::$cacheDir, 0755, true);
            } catch (Exception $e) {
                error_log("RateLimiter: Cannot create cache directory: " . $e->getMessage());
                return false;
            }
        }
        return is_dir(self::$cacheDir) && is_writable(self::$cacheDir);
    }

    /**
     * Nettoyer les vieux fichiers de cache (appelé périodiquement)
     */
    public static function cleanup($olderThanHours = 24) {
        self::ensureCacheDir();

        $files = glob(self::$cacheDir . '*');
        $threshold = time() - ($olderThanHours * 3600);

        foreach ($files as $file) {
            if (filemtime($file) < $threshold) {
                unlink($file);
            }
        }
    }
}
?>
