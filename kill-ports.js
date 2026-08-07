const { execSync } = require('child_process');

const args = process.argv.slice(2);
const portsToKill = args.length > 0
  ? args.map((p) => parseInt(p, 10)).filter(Boolean)
  : [4000, 8081, 5173, 19000, 19001, 19002, 3000];

function killPort(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const lines = output.split(/\r?\n/);
      const pids = new Set();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('LISTENING')) continue;
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 5) {
          const localAddr = parts[1];
          const pid = parts[parts.length - 1];
          if (localAddr.endsWith(`:${port}`) && pid && pid !== '0' && pid !== `${process.pid}`) {
            pids.add(pid);
          }
        }
      }
      if (pids.size === 0) {
        console.log(`[kill-ports] Порт ${port} свободен.`);
        return;
      }
      for (const pid of pids) {
        console.log(`[kill-ports] Закрываем процесс PID ${pid} на порту ${port}...`);
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[kill-ports] Процесс ${pid} на порту ${port} успешно завершен.`);
        } catch (e) {
          // Process already killed or access denied
        }
      }
    } catch (err) {
      console.log(`[kill-ports] Порт ${port} свободен.`);
    }
  } else {
    try {
      const pidsStr = execSync(`lsof -t -i:${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const pids = pidsStr.trim().split(/\s+/).filter(Boolean);
      for (const pid of pids) {
        console.log(`[kill-ports] Закрываем процесс PID ${pid} на порту ${port}...`);
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        } catch (e) {}
      }
    } catch (e) {
      console.log(`[kill-ports] Порт ${port} свободен.`);
    }
  }
}

console.log(`[kill-ports] Проверка и освобождение портов: ${portsToKill.join(', ')}...`);
portsToKill.forEach(killPort);
console.log(`[kill-ports] Готово!\n`);
