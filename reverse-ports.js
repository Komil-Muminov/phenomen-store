const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORTS = [8081, 4000];
const TIMEOUT_MS = 20000;
const BUNDLED = path.join(__dirname, '.tools', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const ADB = fs.existsSync(BUNDLED) ? BUNDLED : 'adb';

function adb(args) {
  return execFileSync(ADB, args, { encoding: 'utf8', timeout: TIMEOUT_MS, stdio: ['pipe', 'pipe', 'pipe'] });
}

function describeDevices() {
  try {
    const lines = adb(['devices']).split(/\r?\n/).slice(1).map((line) => line.trim()).filter(Boolean);
    const pending = lines.filter((line) => /unauthorized|offline/.test(line));

    if (pending.length > 0) {
      console.warn('[reverse-ports] Телефон подключён, но отладка не подтверждена — разреши её на экране телефона.');
    }

    if (lines.length === 0) {
      console.warn('[reverse-ports] Телефон не виден. Проверь кабель и режим передачи файлов.');
    }
  } catch (error) {
    console.warn(`[reverse-ports] Не удалось опросить устройства: ${error.message}`);
  }
}

try {
  PORTS.forEach((port) => adb(['reverse', `tcp:${port}`, `tcp:${port}`]));
  console.log(`[reverse-ports] Проброшены порты: ${adb(['reverse', '--list']).trim().replace(/\s+/g, ' ') || PORTS.join(', ')}`);
} catch (error) {
  console.warn(`[reverse-ports] Проброс не выполнен: ${error.message.split('\n')[0]}`);
  describeDevices();
  console.warn('[reverse-ports] Телефон не увидит сервер на 4000. Подключи телефон и запусти "npm run reverse".');
}
