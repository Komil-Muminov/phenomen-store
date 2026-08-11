const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORTS = [8081, 4000];
const DAEMON_TIMEOUT_MS = 60000;
const COMMAND_TIMEOUT_MS = 30000;
const ATTEMPTS = 2;
const BUNDLED = path.join(__dirname, '.tools', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const ADB = fs.existsSync(BUNDLED) ? BUNDLED : 'adb';

const adb = (args, timeout = COMMAND_TIMEOUT_MS) => execFileSync(ADB, args, {
  encoding: 'utf8',
  timeout,
  stdio: ['pipe', 'pipe', 'pipe'],
});

const startDaemon = () => {
  try {
    adb(['start-server'], DAEMON_TIMEOUT_MS);
  } catch {
    console.warn('[reverse-ports] Демон adb не поднялся с первого раза, продолжаю.');
  }
};

const describeDevices = () => {
  try {
    const lines = adb(['devices']).split(/\r?\n/).slice(1).map((line) => line.trim()).filter(Boolean);

    if (lines.length === 0) {
      console.warn('[reverse-ports] Телефон не виден. Проверь кабель и режим передачи файлов.');

      return;
    }

    if (lines.some((line) => /unauthorized|offline/.test(line))) {
      console.warn('[reverse-ports] Отладка не подтверждена — разреши её на экране телефона.');
    }
  } catch {
    console.warn('[reverse-ports] Опросить устройства не удалось.');
  }
};

const applyReverse = () => {
  PORTS.forEach((port) => adb(['reverse', `tcp:${port}`, `tcp:${port}`]));

  const list = adb(['reverse', '--list']).trim().replace(/\s+/g, ' ');

  console.log(`[reverse-ports] Проброшены порты: ${list || PORTS.join(', ')}`);
};

startDaemon();

let lastError = null;

for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  try {
    applyReverse();
    lastError = null;
    break;
  } catch (error) {
    lastError = error;

    if (attempt < ATTEMPTS) {
      console.warn(`[reverse-ports] Попытка ${attempt} не удалась, повторяю.`);
    }
  }
}

if (lastError) {
  console.warn(`[reverse-ports] Проброс не выполнен: ${String(lastError.message).split('\n')[0]}`);
  describeDevices();
  console.warn('[reverse-ports] Телефон не увидит сервер на 4000. Повтори "npm run reverse".');
}
