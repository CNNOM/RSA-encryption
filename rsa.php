<?php
header('Content-Type: application/json');

// Простые RSA функции для демонстрации
function gcd($a, $b) {
    while ($b != 0) {
        $temp = $b;
        $b = $a % $b;
        $a = $temp;
    }
    return $a;
}

function extended_gcd($a, $b) {
    if ($b == 0) {
        return [$a, 1, 0];
    }
    
    list($g, $x1, $y1) = extended_gcd($b, $a % $b);
    return [$g, $y1, $x1 - floor($a / $b) * $y1];
}

function mod_inverse($a, $m) {
    list($g, $x) = extended_gcd($a, $m);
    if ($g != 1) {
        return null;
    }
    return ($x % $m + $m) % $m;
}

function is_prime($num) {
    if ($num <= 1) return false;
    if ($num <= 3) return true;
    if ($num % 2 == 0 || $num % 3 == 0) return false;
    
    for ($i = 5; $i * $i <= $num; $i += 6) {
        if ($num % $i == 0 || $num % ($i + 2) == 0) return false;
    }
    return true;
}

// Обработка запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $response = [];
    
    switch ($action) {
        case 'generate_keys':
            $p = intval($_POST['p'] ?? 61);
            $q = intval($_POST['q'] ?? 53);
            
            if (!is_prime($p) || !is_prime($q)) {
                $response = ['error' => 'Оба числа должны быть простыми'];
                break;
            }
            
            $n = $p * $q;
            $phi = ($p - 1) * ($q - 1);
            
            // Выбор e
            $e = 17;
            if ($e >= $phi || gcd($e, $phi) != 1) {
                for ($i = 3; $i < $phi; $i += 2) {
                    if (gcd($i, $phi) == 1) {
                        $e = $i;
                        break;
                    }
                }
            }
            
            $d = mod_inverse($e, $phi);
            
            if ($d === null) {
                $response = ['error' => 'Не удалось найти обратный элемент'];
                break;
            }
            
            $response = [
                'success' => true,
                'n' => $n,
                'phi' => $phi,
                'e' => $e,
                'd' => $d,
                'public_key' => ['n' => $n, 'e' => $e],
                'private_key' => ['n' => $n, 'd' => $d]
            ];
            break;
            
        case 'encrypt':
            $message = $_POST['message'] ?? '';
            $n = intval($_POST['n'] ?? 0);
            $e = intval($_POST['e'] ?? 0);
            
            if (!$n || !$e || !$message) {
                $response = ['error' => 'Недостаточно данных'];
                break;
            }
            
            $encrypted = [];
            for ($i = 0; $i < strlen($message); $i++) {
                $charCode = ord($message[$i]);
                $encrypted[] = bcpowmod($charCode, $e, $n);
            }
            
            $response = [
                'success' => true,
                'encrypted' => implode(' ', $encrypted)
            ];
            break;
            
        case 'decrypt':
            $encrypted = $_POST['encrypted'] ?? '';
            $n = intval($_POST['n'] ?? 0);
            $d = intval($_POST['d'] ?? 0);
            
            if (!$n || !$d || !$encrypted) {
                $response = ['error' => 'Недостаточно данных'];
                break;
            }
            
            $blocks = explode(' ', $encrypted);
            $decrypted = '';
            
            foreach ($blocks as $block) {
                $charCode = bcpowmod($block, $d, $n);
                $decrypted .= chr($charCode);
            }
            
            $response = [
                'success' => true,
                'decrypted' => $decrypted
            ];
            break;
            
        default:
            $response = ['error' => 'Неизвестное действие'];
    }
    
    echo json_encode($response);
    exit;
}
?>