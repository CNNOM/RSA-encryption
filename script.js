document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const prime1Input = document.getElementById('prime1');
    const prime2Input = document.getElementById('prime2');
    const generatePrimesBtn = document.getElementById('generatePrimes');
    const generateKeysBtn = document.getElementById('generateKeys');
    const keyDetails = document.getElementById('keyDetails');
    const messageInput = document.getElementById('message');
    const encryptedMessageInput = document.getElementById('encryptedMessage');
    const decryptedMessageInput = document.getElementById('decryptedMessage');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const attackBtn = document.getElementById('attackBtn');
    const historyDiv = document.getElementById('history');
    const toast = document.getElementById('toast');
    const fileInput = document.getElementById('fileInput');
    const fileDropArea = document.getElementById('fileDropArea');
    const fileInfo = document.getElementById('fileInfo');
    const filePreview = document.getElementById('filePreview');
    const fileContentDiv = document.getElementById('fileContent');
    const downloadEncryptedBtn = document.getElementById('downloadEncrypted');
    const downloadDecryptedBtn = document.getElementById('downloadDecrypted');
    const clearFileBtn = document.getElementById('clearFile');

    let currentFile = null;
    let currentPublicKey = null;
    let currentPrivateKey = null;

    // Список простых чисел для демонстрации
    const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    // ============ УТИЛИТЫ ============

    // Показать уведомление
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add('show');

        if (type === 'success') {
            toast.style.background = '#4caf50';
        } else if (type === 'error') {
            toast.style.background = '#f44336';
        } else if (type === 'warning') {
            toast.style.background = '#ff9800';
        }

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Проверить, является ли число простым
    function isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;

        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        return true;
    }

    // Найти наибольший общий делитель
    function gcd(a, b) {
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    // Расширенный алгоритм Евклида
    function extendedGcd(a, b) {
        if (b === 0) return [a, 1, 0];

        const [g, x1, y1] = extendedGcd(b, a % b);
        return [g, y1, x1 - Math.floor(a / b) * y1];
    }

    // Модульная инверсия
    function modInverse(a, m) {
        const [g, x] = extendedGcd(a, m);
        if (g !== 1) return null;
        return (x % m + m) % m;
    }

    // Быстрое возведение в степень по модулю
    function modPow(base, exponent, modulus) {
        if (modulus === 1) return 0;

        let result = 1;
        base = base % modulus;

        while (exponent > 0) {
            if (exponent % 2 === 1) {
                result = (result * base) % modulus;
            }
            exponent = Math.floor(exponent / 2);
            base = (base * base) % modulus;
        }

        return result;
    }

    // ============ РАБОТА С ФАЙЛАМИ ============

    // Обработка клика по области загрузки
    fileDropArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    clearFileBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        filePreview.style.display = 'none';
        messageInput.value = '';
        showToast('Файл удален', 'info');
    });

    function handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.txt')) {
            showToast('Пожалуйста, выберите текстовый файл (.txt)', 'error');
            return;
        }

        if (file.size > 100000) { // Ограничение 100KB
            showToast('Файл слишком большой. Максимальный размер: 100KB', 'error');
            return;
        }

        currentFile = file;

        // Показать информацию о файле
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = file.size;
        fileInfo.style.display = 'flex';

        // Прочитать содержимое файла
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            fileContentDiv.textContent = content.substring(0, 1000);
            if (content.length > 1000) {
                fileContentDiv.textContent += '\n... (файл обрезан, показаны первые 1000 символов)';
            }
            filePreview.style.display = 'block';

            // Установить содержимое в текстовое поле
            messageInput.value = content;

            showToast(`Файл "${file.name}" загружен`, 'success');
        };
        reader.onerror = function () {
            showToast('Ошибка при чтении файла', 'error');
        };
        reader.readAsText(file);
    }

    // ============ ГЕНЕРАЦИЯ КЛЮЧЕЙ ============

    // Сгенерировать случайные простые числа
    generatePrimesBtn.addEventListener('click', () => {
        const randomPrime1 = smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
        let randomPrime2;

        do {
            randomPrime2 = smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
        } while (randomPrime2 === randomPrime1);

        prime1Input.value = randomPrime1;
        prime2Input.value = randomPrime2;

    });

    // Генерация ключей RSA
    generateKeysBtn.addEventListener('click', () => {
        const p = parseInt(prime1Input.value);
        const q = parseInt(prime2Input.value);

        // Проверка входных данных
        if (!isPrime(p) || !isPrime(q)) {
            showToast('Оба числа должны быть простыми!', 'error');
            return;
        }

        if (p === q) {
            showToast('Числа p и q должны быть разными!', 'error');
            return;
        }

        // Вычисление параметров RSA
        const n = p * q;
        const phi = (p - 1) * (q - 1);

        // Выбор открытой экспоненты e (обычно 65537, но для маленьких чисел берем меньше)
        let e = 17; // Стандартное значение для демонстрации
        if (e >= phi || gcd(e, phi) !== 1) {
            // Ищем подходящее e
            for (let i = 3; i < phi; i += 2) {
                if (gcd(i, phi) === 1) {
                    e = i;
                    break;
                }
            }
        }

        // Вычисление секретной экспоненты d
        const d = modInverse(e, phi);

        if (d === null) {
            showToast('Не удалось найти обратный элемент для e!', 'error');
            return;
        }

        // Отображение результатов
        document.getElementById('nValue').textContent = n;
        document.getElementById('phiValue').textContent = phi;
        document.getElementById('eValue').textContent = e;
        document.getElementById('dValue').textContent = d;

        document.getElementById('publicN').textContent = n;
        document.getElementById('publicE').textContent = e;
        document.getElementById('privateN').textContent = n;
        document.getElementById('privateD').textContent = d;

        // Сохранение ключей
        currentPublicKey = { n, e };
        currentPrivateKey = { n, d };

        // Показать детали
        keyDetails.style.display = 'block';

        showToast('Ключи успешно сгенерированы!', 'success');
    });


    // ============ ШИФРОВАНИЕ ============

    encryptBtn.addEventListener('click', () => {
        if (!currentPublicKey) {
            showToast('Сначала сгенерируйте ключи!', 'error');
            return;
        }

        const message = messageInput.value.trim();
        if (!message) {
            showToast('Введите текст для шифрования!', 'error');
            return;
        }

        const { n, e } = currentPublicKey;
        const encryptedBlocks = [];

        // Шифрование каждого символа по отдельности (для демонстрации)
        for (let i = 0; i < message.length; i++) {
            const charCode = message.charCodeAt(i);
            const encrypted = modPow(charCode, e, n);
            encryptedBlocks.push(encrypted);
        }

        const encryptedText = encryptedBlocks.join(' ');
        encryptedMessageInput.value = encryptedText;

        // Показать кнопку скачивания зашифрованного файла
        downloadEncryptedBtn.style.display = 'inline-flex';

        showToast('Текст успешно зашифрован!', 'success');
    });

    // ============ ДЕШИФРОВАНИЕ ============

    decryptBtn.addEventListener('click', () => {
        if (!currentPrivateKey) {
            showToast('Сначала сгенерируйте ключи!', 'error');
            return;
        }

        const encryptedText = encryptedMessageInput.value.trim();
        if (!encryptedText) {
            showToast('Нет зашифрованного текста для расшифровки!', 'error');
            return;
        }

        const { n, d } = currentPrivateKey;
        const encryptedBlocks = encryptedText.split(' ').map(Number);
        let decryptedMessage = '';

        try {
            for (const block of encryptedBlocks) {
                const decryptedCode = modPow(block, d, n);
                decryptedMessage += String.fromCharCode(decryptedCode);
            }

            decryptedMessageInput.value = decryptedMessage;

            // Показать кнопку скачивания расшифрованного файла
            downloadDecryptedBtn.style.display = 'inline-flex';

            showToast('Текст успешно расшифрован!', 'success');

        } catch (error) {
            showToast('Ошибка при дешифровании: ' + error.message, 'error');
        }
    });

    // ============ СКАЧИВАНИЕ ФАЙЛОВ ============

    downloadEncryptedBtn.addEventListener('click', () => {
        const encryptedText = encryptedMessageInput.value;
        if (!encryptedText) return;

        const blob = new Blob([encryptedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'encrypted_message.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Зашифрованный файл скачан!', 'success');
    });

    downloadDecryptedBtn.addEventListener('click', () => {
        const decryptedText = decryptedMessageInput.value;
        if (!decryptedText) return;

        const blob = new Blob([decryptedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decrypted_message.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Расшифрованный файл скачан!', 'success');
    });

    // ============ АТАКА ФАКТОРИЗАЦИЕЙ ============

    attackBtn.addEventListener('click', () => {
        if (!currentPublicKey) {
            showToast('Сначала сгенерируйте ключи!', 'error');
            return;
        }

        const { n } = currentPublicKey;
        const attackResult = document.getElementById('attackResult');
        const attackSteps = document.getElementById('attackSteps');
        const crackedKey = document.getElementById('crackedKey');

        attackResult.style.display = 'block';
        attackSteps.innerHTML = '<p>Начинаем факторизацию числа n = ' + n + '...</p>';

        // Простая факторизация перебором (только для маленьких чисел!)
        let factors = [];
        let tempN = n;
        let steps = '';
        let attempts = 0;

        for (let i = 2; i * i <= tempN; i++) {
            attempts++;
            steps += `<p>Попытка ${attempts}: проверяем делитель ${i}...</p>`;

            while (tempN % i === 0) {
                factors.push(i);
                tempN /= i;
                steps += `<p>  Найден делитель: ${i}! n/${i} = ${tempN}</p>`;
            }
        }

        if (tempN > 1) {
            factors.push(tempN);
            steps += `<p>Оставшийся делитель: ${tempN}</p>`;
        }

        if (factors.length === 2) {
            const p = factors[0];
            const q = factors[1];
            const phi = (p - 1) * (q - 1);
            const e = currentPublicKey.e;
            const d = modInverse(e, phi);

            steps += `<p>Успех! Найдены простые множители: p = ${p}, q = ${q}</p>`;
            steps += `<p>Вычисляем φ(n) = (${p}-1) × (${q}-1) = ${phi}</p>`;
            steps += `<p>Находим секретную экспоненту d = e⁻¹ mod φ(n) = ${d}</p>`;

            document.getElementById('crackedD').textContent = d;
            crackedKey.style.display = 'block';

            if (currentPrivateKey && d === currentPrivateKey.d) {
                steps += `<p style="color: #f44336; font-weight: bold;">Ключ успешно взломан! d совпадает с оригиналом.</p>`;
            }

            showToast('Факторизация успешна! Ключ взломан.', 'warning');

        } else {
            steps += `<p>Не удалось найти два простых множителя. Возможно, n не является произведением двух простых чисел.</p>`;
            showToast('Факторизация не удалась', 'error');
        }

        attackSteps.innerHTML = steps;
    });

    // ============ ВКЛАДКИ ============

    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Обновить активные вкладки
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // ============ ИНИЦИАЛИЗАЦИЯ ============

    // Сгенерировать начальные ключи
    generateKeysBtn.click();

});