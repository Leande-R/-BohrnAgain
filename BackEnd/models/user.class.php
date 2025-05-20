<?php
class User {
    private $salutation;
    private $firstname;
    private $lastname;
    private $address;
    private $PLZ;
    private $city;
    private $email;
    private $username;
    private $password;
    private $payment_info;
    private $role;
    private $is_active;


    public function __construct($data) {
        $this->salutation = trim($data['salutation']);
        $this->firstname = trim($data['firstname']);
        $this->lastname = trim($data['lastname']);
        $this->address = trim($data['address']);
        $this->PLZ = trim($data['PLZ']);
        $this->city = trim($data['city']);
        $this->email = trim($data['email']);
        $this->username = trim($data['username']);
        $this->password = trim($data['password']);
        $this->payment_info = trim($data['payment_info']);
        $this->role = 'user';
        $this->is_active = 1;

    }

    public function validate() {
        if (!$this->email || !$this->username || !$this->password) {
            return "Pflichtfelder fehlen.";
        }
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            return "Ungültige E-Mail-Adresse.";
        }
        if (strlen($this->password) < 6) {
            return "Passwort muss mindestens 6 Zeichen lang sein.";
        }
        return true;
    }

    public function save($pdo) {
        // Prüfen ob Benutzername oder Email schon existieren
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$this->username, $this->email]);
        if ($stmt->fetch()) {
            return "Benutzername oder E-Mail existieren bereits.";
        }

        $hashedPassword = password_hash($this->password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("
            INSERT INTO users 
            (salutation, firstname, lastname, address, PLZ, city, email, username, password_hash, payment_info, role, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $this->salutation,
            $this->firstname,
            $this->lastname,
            $this->address,
            $this->PLZ,
            $this->city,
            $this->email,
            $this->username,
            $hashedPassword,
            $this->payment_info,
            $this->role,
            $this->is_active
        ]);


        return true;
    }
}
?>
