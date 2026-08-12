const { execFileSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const API_PORT = 4000;
const METRO_PORT = 8081;
const REQUEST_TIMEOUT_MS = 4000;
const ADB_TIMEOUT_MS = 20000;
const BUNDLED_ADB = path.join(__dirname, '.tools', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const ADB = fs.existsSync(BUNDLED_ADB) ? BUNDLED_ADB : 'adb';

const say = (ok, message) => console.log(`${ok ? '  OK ' : ' НЕТ '} ${message}`);

const readEnv = () => {
  const file = path.join(__dirname, '.env');

  if (!fs.existsSync(file)) {
    return {};
  }

  return fs.readFileSync(file, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    return match ? { ...acc, [match[1]]: match[2].trim() } : acc;
  }, {});
};

const ping = (host) => new Promise((resolve) => {
  const request = http.get(
    { host, port: API_PORT, path: '/health', timeout: REQUEST_TIMEOUT_MS },
    (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    },
  );

  request.on('timeout', () => { request.destroy(); resolve(false); });
  request.on('error', () => resolve(false));
});

const reverseList = () => {
  try {
    return execFileSync(ADB, ['reverse', '--list'], { encoding: 'utf8', timeout: ADB_TIMEOUT_MS });
  } catch {
    return null;
  }
};

const main = async () => {
  console.log('\n[doctor] проверка связи телефона с сервером\n');

  const env = readEnv();
  const apiUrl = env.EXPO_PUBLIC_API_URL || 'http://localhost:4000 (по умолчанию)';
  const ipv4 = await ping('127.0.0.1');
  const ipv6 = ipv4 ? true : await ping('::1');
  const list = reverseList();
  const hasApi = Boolean(list && list.includes(`tcp:${API_PORT}`));
  const hasMetro = Boolean(list && list.includes(`tcp:${METRO_PORT}`));
  const usbMode = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

  say(ipv4, `сервер отвечает на 127.0.0.1:${API_PORT}`);
  say(Boolean(list), 'adb доступен и видит устройство');
  say(hasApi, `порт ${API_PORT} проброшен на телефон`);
  say(hasMetro, `порт ${METRO_PORT} проброшен на телефон`);
  console.log(`      адрес API в приложении: ${apiUrl}`);

  console.log('\n[doctor] вывод\n');

  if (!ipv4 && ipv6) {
    console.log('  Сервер слушает только IPv6. adb ходит по 127.0.0.1 и не достучится.');
    console.log('  Подтяни ветку: сервер должен писать "слушает 0.0.0.0".');
  } else if (!ipv4) {
    console.log('  Сервер не отвечает. Запусти "npm run dev:server" и посмотри его панель.');
  } else if (!list) {
    console.log('  adb не видит телефон. Проверь кабель, режим передачи файлов и отладку.');
  } else if (!hasApi) {
    console.log(`  Порт ${API_PORT} не проброшен. Запусти "npm run reverse".`);
  } else if (!usbMode) {
    console.log('  Приложение ходит по сети, а не через USB.');
    console.log('  Для USB поставь EXPO_PUBLIC_API_URL=http://localhost:4000 и перезапусти Expo с -c.');
  } else {
    console.log('  Цепочка целая. Если приложение всё равно пишет "нет связи",');
    console.log('  дело в брандмауэре Windows на порту 4000 либо в кэше приложения:');
    console.log('  закрой его на телефоне и запусти "npx expo start --localhost -c" из папки client.');
  }

  console.log('');
};

main();
