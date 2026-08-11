const { execFileSync } = require('child_process');
const path = require('path');

const PORTS = [8081, 4000];
const WAIT_TIMEOUT_MS = 20000;
const ADB = path.join(__dirname, '.tools', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');

function adb(args, timeout) {
  return execFileSync(ADB, args, { encoding: 'utf8', timeout, stdio: ['pipe', 'pipe', 'pipe'] });
}

function findDevice() {
  const output = adb(['devices'], WAIT_TIMEOUT_MS);
  const lines = output.split(/\r?\n/).slice(1).map((line) => line.trim()).filter(Boolean);
  const ready = lines.filter((line) => line.endsWith('\tdevice'));
  const pending = lines.filter((line) => line.endsWith('\tunauthorized') || line.endsWith('\toffline'));

  if (ready.length === 0 && pending.length > 0) {
    console.warn('[reverse-ports] Телефон подключён, но не подтверждён — разреши отладку на экране телефона.');
  }

  return ready.length > 0;
}

try {
  adb(['start-server'], WAIT_TIMEOUT_MS);

  if (!findDevice()) {
    console.warn('[reverse-ports] Телефон не найден. Подключи по USB и запусти "npm run reverse".');
    process.exit(0);
  }

  adb(['wait-for-device'], WAIT_TIMEOUT_MS);
  PORTS.forEach((port) => adb(['reverse', `tcp:${port}`, `tcp:${port}`], WAIT_TIMEOUT_MS));
  console.log(`[reverse-ports] Проброшены порты: ${PORTS.join(', ')}.`);
} catch (error) {
  console.warn(`[reverse-ports] Проброс не выполнен: ${error.message}`);
  console.warn('[reverse-ports] Телефон не увидит сервер на 4000. Повтори "npm run reverse".');
}
