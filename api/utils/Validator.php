<?php
/**
 * Classe utilitaire pour la validation des données
 * Centralise toutes les règles de validation de l'application
 */

class Validator {
    private $errors = [];

    /**
     * Valider un email
     */
    public function validateEmail($email, $fieldName = 'email') {
        if (empty($email)) {
            $this->errors[$fieldName] = "L'email est requis";
            return false;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$fieldName] = "L'email n'est pas valide";
            return false;
        }

        return true;
    }

    /**
     * Valider un mot de passe
     */
    public function validatePassword($password, $fieldName = 'password') {
        if (empty($password)) {
            $this->errors[$fieldName] = "Le mot de passe est requis";
            return false;
        }

        if (strlen($password) < 8) {
            $this->errors[$fieldName] = "Le mot de passe doit contenir au moins 8 caractères";
            return false;
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $this->errors[$fieldName] = "Le mot de passe doit contenir au moins une majuscule";
            return false;
        }

        if (!preg_match('/[a-z]/', $password)) {
            $this->errors[$fieldName] = "Le mot de passe doit contenir au moins une minuscule";
            return false;
        }

        if (!preg_match('/[0-9]/', $password)) {
            $this->errors[$fieldName] = "Le mot de passe doit contenir au moins un chiffre";
            return false;
        }

        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $this->errors[$fieldName] = "Le mot de passe doit contenir au moins un caractère spécial";
            return false;
        }

        return true;
    }

    /**
     * Valider un numéro de téléphone algérien
     */
    public function validatePhone($phone, $fieldName = 'telephone', $required = false) {
        if (empty($phone)) {
            if ($required) {
                $this->errors[$fieldName] = "Le numéro de téléphone est requis";
                return false;
            }
            return true; // Optionnel et vide = valide
        }

        // Formats acceptés: +213XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone); // Nettoyer les espaces et caractères

        $pattern = '/^(\+213|0)?[5-7][0-9]{8}$/';

        if (!preg_match($pattern, $phone)) {
            $this->errors[$fieldName] = "Le numéro de téléphone n'est pas valide (format: +213XXXXXXXXX ou 0XXXXXXXXX)";
            return false;
        }

        return true;
    }

    /**
     * Valider une chaîne requise
     */
    public function validateRequired($value, $fieldName) {
        if (empty($value) && $value !== '0' && $value !== 0) {
            $this->errors[$fieldName] = "Le champ $fieldName est requis";
            return false;
        }

        return true;
    }

    /**
     * Valider une longueur minimale
     */
    public function validateMinLength($value, $minLength, $fieldName) {
        if (strlen($value) < $minLength) {
            $this->errors[$fieldName] = "Le champ $fieldName doit contenir au moins $minLength caractères";
            return false;
        }

        return true;
    }

    /**
     * Valider une longueur maximale
     */
    public function validateMaxLength($value, $maxLength, $fieldName) {
        if (strlen($value) > $maxLength) {
            $this->errors[$fieldName] = "Le champ $fieldName ne doit pas dépasser $maxLength caractères";
            return false;
        }

        return true;
    }

    /**
     * Valider une date
     */
    public function validateDate($date, $fieldName = 'date', $required = true) {
        if (empty($date)) {
            if ($required) {
                $this->errors[$fieldName] = "La date est requise";
                return false;
            }
            return true;
        }

        $timestamp = strtotime($date);
        if ($timestamp === false) {
            $this->errors[$fieldName] = "La date n'est pas valide";
            return false;
        }

        return true;
    }

    /**
     * Valider qu'une date est après une autre
     */
    public function validateDateAfter($date1, $date2, $fieldName = 'date') {
        $timestamp1 = strtotime($date1);
        $timestamp2 = strtotime($date2);

        if ($timestamp1 <= $timestamp2) {
            $this->errors[$fieldName] = "La date doit être après la date de début";
            return false;
        }

        return true;
    }

    /**
     * Valider qu'une date est dans le futur
     */
    public function validateDateFuture($date, $fieldName = 'date') {
        $timestamp = strtotime($date);
        $now = time();

        if ($timestamp < $now) {
            $this->errors[$fieldName] = "La date doit être dans le futur";
            return false;
        }

        return true;
    }

    /**
     * Valider un montant (nombre positif)
     */
    public function validateAmount($amount, $fieldName = 'montant', $required = true) {
        if ($amount === null || $amount === '') {
            if ($required) {
                $this->errors[$fieldName] = "Le montant est requis";
                return false;
            }
            return true;
        }

        if (!is_numeric($amount) || $amount < 0) {
            $this->errors[$fieldName] = "Le montant doit être un nombre positif";
            return false;
        }

        return true;
    }

    /**
     * Valider un UUID
     */
    public function validateUuid($uuid, $fieldName = 'id') {
        if (empty($uuid)) {
            $this->errors[$fieldName] = "L'identifiant est requis";
            return false;
        }

        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';

        if (!preg_match($pattern, $uuid)) {
            $this->errors[$fieldName] = "L'identifiant n'est pas valide";
            return false;
        }

        return true;
    }

    /**
     * Valider une énumération (valeur parmi une liste)
     */
    public function validateEnum($value, $allowedValues, $fieldName) {
        if (!in_array($value, $allowedValues, true)) {
            $allowed = implode(', ', $allowedValues);
            $this->errors[$fieldName] = "La valeur doit être parmi: $allowed";
            return false;
        }

        return true;
    }

    /**
     * Récupérer toutes les erreurs
     */
    public function getErrors() {
        return $this->errors;
    }

    /**
     * Vérifier s'il y a des erreurs
     */
    public function hasErrors() {
        return !empty($this->errors);
    }

    /**
     * Récupérer le premier message d'erreur
     */
    public function getFirstError() {
        if (empty($this->errors)) {
            return null;
        }

        return reset($this->errors);
    }

    /**
     * Réinitialiser les erreurs
     */
    public function reset() {
        $this->errors = [];
    }

    /**
     * Méthode statique pour valider rapidement un email
     */
    public static function isValidEmail($email) {
        $validator = new self();
        return $validator->validateEmail($email);
    }

    /**
     * Méthode statique pour valider rapidement un téléphone
     */
    public static function isValidPhone($phone) {
        $validator = new self();
        return $validator->validatePhone($phone, 'telephone', false);
    }

    /**
     * Méthode statique pour valider rapidement un mot de passe
     */
    public static function isValidPassword($password) {
        $validator = new self();
        return $validator->validatePassword($password);
    }

    /**
     * Valider une valeur numerique
     */
    public function validateNumeric($value, $fieldName = 'value', $required = false) {
        if ($value === null || $value === '') {
            if ($required) {
                $this->errors[$fieldName] = "Le champ $fieldName est requis";
                return false;
            }
            return true;
        }

        if (!is_numeric($value)) {
            $this->errors[$fieldName] = "Le champ $fieldName doit être un nombre";
            return false;
        }

        return true;
    }

    /**
     * Methode statique pour valider un email (alias pour isValidEmail)
     */
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Methode statique pour valider un telephone algerien
     */
    public static function algerianPhone($phone) {
        if (empty($phone)) {
            return false;
        }

        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
        $pattern = '/^(\+213|0)?[5-7][0-9]{8}$/';

        return preg_match($pattern, $phone) === 1;
    }
}
?>
