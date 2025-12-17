<?php
/**
 * Helper de réponse API amélioré
 * Garantit que seul du JSON valide est retourné
 */

class ResponseHelper {
    public static function json($data, $code = 200) {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    public static function success($data = null, $message = "Succès", $code = 200) {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    public static function error($message = "Une erreur est survenue", $code = 400, $details = null) {
        self::json([
            'success' => false,
            'error' => $message,
            'details' => $details
        ], $code);
    }
}
