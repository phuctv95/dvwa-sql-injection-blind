import { getDatabaseVersion } from './dvwa-sql-injection-blind';
import { log } from './logger';

async function main() {
  log('Final result:', await getDatabaseVersion());
}

main();
