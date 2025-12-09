<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Демонстрация алгоритма RSA</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-lock"></i> Демонстрация алгоритма RSA</h1>
            <p class="subtitle">Интерактивный симулятор асимметричного шифрования с поддержкой файлов</p>
        </header>

        <div class="alert info">
            <i class="fas fa-info-circle"></i>
            <strong>Примечание:</strong> Для наглядности используются маленькие простые числа. В реальных системах используются числа длиной 1024-4096 бит.
        </div>

        <div class="card">
            <h2><i class="fas fa-key"></i> Шаг 1: Генерация ключей</h2>
            <div class="form-group">
                <label for="prime1">Простое число p:</label>
                <input type="number" id="prime1" value="61" min="2" max="999">
                
                <label for="prime2">Простое число q:</label>
                <input type="number" id="prime2" value="53" min="2" max="999">
                
                <div class="button-group">
                    <button id="generatePrimes" class="btn secondary">
                        <i class="fas fa-random"></i> Случайные простые числа
                    </button>
                    
                    <button id="generateKeys" class="btn primary">
                        <i class="fas fa-key"></i> Сгенерировать ключи
                    </button>
                </div>
            </div>
            
            <div id="keyDetails" class="details" style="display: none;">
                <h3>Вычисленные параметры:</h3>
                <div class="output-grid">
                    <div><span class="label">n = p × q:</span> <span id="nValue" class="value"></span></div>
                    <div><span class="label">φ(n) = (p-1)(q-1):</span> <span id="phiValue" class="value"></span></div>
                    <div><span class="label">Открытая экспонента e:</span> <span id="eValue" class="value"></span></div>
                    <div><span class="label">Закрытая экспонента d:</span> <span id="dValue" class="value"></span></div>
                </div>
                
                <div class="keys">
                    <div class="key-box">
                        <h4><i class="fas fa-lock-open"></i> Открытый ключ (Public Key)</h4>
                        <div class="key-content">
                            <div>n: <code id="publicN"></code></div>
                            <div>e: <code id="publicE"></code></div>
                        </div>
                        <button id="copyPublic" class="btn small">
                            <i class="fas fa-copy"></i> Копировать
                        </button>
                    </div>
                    
                    <div class="key-box">
                        <h4><i class="fas fa-lock"></i> Закрытый ключ (Private Key)</h4>
                        <div class="key-content">
                            <div>n: <code id="privateN"></code></div>
                            <div>d: <code id="privateD"></code></div>
                        </div>
                        <button id="copyPrivate" class="btn small">
                            <i class="fas fa-copy"></i> Копировать
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2><i class="fas fa-file-upload"></i> Шаг 2: Работа с текстом</h2>
            
            <div class="tabs">
                <button class="tab-btn active" data-tab="manual">Ручной ввод</button>
                <button class="tab-btn" data-tab="file">Загрузка файла</button>
            </div>
            
            <div id="manual-tab" class="tab-content active">
                <div class="form-group">
                    <label for="message">Исходный текст (только латинские буквы и цифры):</label>
                    <textarea id="message" rows="3" placeholder="Введите текст для шифрования...">Hello RSA!</textarea>
                </div>
            </div>
            
            <div id="file-tab" class="tab-content">
                <div class="form-group">
                    <label for="fileInput">Выберите текстовый файл (.txt):</label>
                    <div class="file-upload-area" id="fileDropArea">
                        <i class="fas fa-cloud-upload-alt fa-2x"></i>
                        <p>Перетащите файл сюда или нажмите для выбора</p>
                        <input type="file" id="fileInput" accept=".txt">
                    </div>
                    <div id="fileInfo" class="file-info" style="display: none;">
                        <p><i class="fas fa-file"></i> Файл: <span id="fileName"></span> (<span id="fileSize"></span> байт)</p>
                        <button id="clearFile" class="btn small secondary">
                            <i class="fas fa-times"></i> Удалить файл
                        </button>
                    </div>
                </div>
                
                <div id="filePreview" class="file-preview" style="display: none;">
                    <h4>Предпросмотр файла:</h4>
                    <div class="preview-content" id="fileContent"></div>
                </div>
            </div>
            
            <div class="button-group">
                <button id="encryptBtn" class="btn primary">
                    <i class="fas fa-shield-alt"></i> Зашифровать
                </button>
                
                <button id="decryptBtn" class="btn secondary">
                    <i class="fas fa-unlock-alt"></i> Расшифровать
                </button>
                
                <button id="downloadEncrypted" class="btn success" style="display: none;">
                    <i class="fas fa-download"></i> Скачать зашифрованный файл
                </button>
                
                <button id="downloadDecrypted" class="btn success" style="display: none;">
                    <i class="fas fa-download"></i> Скачать расшифрованный файл
                </button>
            </div>
        </div>

        <div class="card">
            <h2><i class="fas fa-lock"></i> Шаг 3: Шифрование</h2>
            <div class="form-group">
                <label for="encryptedMessage">Зашифрованное сообщение (числа через пробел):</label>
                <textarea id="encryptedMessage" rows="3" readonly></textarea>
            </div>
        </div>

        <div class="card">
            <h2><i class="fas fa-unlock"></i> Шаг 4: Дешифрование</h2>
            <div class="form-group">
                <label for="decryptedMessage">Расшифрованное сообщение:</label>
                <textarea id="decryptedMessage" rows="3" readonly></textarea>
            </div>
        </div>

        <div class="card">
            <h2><i class="fas fa-user-secret"></i> Шаг 5: Атака факторизацией (только для обучения!)</h2>
            <div class="alert warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Внимание:</strong> Эта демонстрация работает только с маленькими числами для наглядности.
            </div>
            
            <div class="form-group">
                <button id="attackBtn" class="btn danger">
                    <i class="fas fa-bomb"></i> Попробовать взломать RSA факторизацией n
                </button>
            </div>
            
            <div id="attackResult" class="attack-result" style="display: none;">
                <h3>Результаты атаки:</h3>
                <div id="attackSteps"></div>
                <div id="crackedKey" style="display: none;">
                    <p><i class="fas fa-key"></i> <strong>Взломанный закрытый ключ d:</strong> <code id="crackedD"></code></p>
                </div>
            </div>
        </div>

        <div class="card">
            <h2><i class="fas fa-history"></i> История операций</h2>
            <div id="history"></div>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="script.js"></script>
</body>
</html>