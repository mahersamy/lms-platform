
const { spawn } = require('node:child_process');
const path = require('node:path');
const webpack = require('webpack');
const { createProjectGraphAsync } = require('nx/src/project-graph/project-graph');

const root = path.resolve(__dirname, '../..');
const mainFile = path.join(root, 'dist/apps/api/main.js');
const webpackConfigPath = path.join(root, 'apps/api/webpack.config.js');

const POLL_INTERVAL = 1000;
const SHUTDOWN_TIMEOUT = 5000;

let serverProcess = null;
let watcher = null;
let isShuttingDown = false;
let restartQueue = Promise.resolve();

process.env.NODE_ENV = 'development';
process.env.NX_DAEMON = 'false';
process.env.NX_TASK_TARGET_PROJECT = 'api';
process.env.NX_TASK_TARGET_TARGET = 'build';
process.env.NX_TASK_TARGET_CONFIGURATION = 'development';

function log(message) {
  console.log(`[dev-watch] ${message}`);
}

// Stop the current NestJS process gracefully.
function stopServer() {
  const child = serverProcess;

  if (!child) return Promise.resolve();

  serverProcess = null;

  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve();
    };

    const timeout = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        log('Graceful shutdown timed out. Sending SIGKILL...');
        child.kill('SIGKILL');
      }

      finish();
    }, SHUTDOWN_TIMEOUT);

    child.once('exit', finish);
    child.once('error', finish);

    child.kill('SIGTERM');
  });
}

// Start NestJS.
function startServer() {
  if (isShuttingDown) return;

  log('Starting API server...');

  const child = spawn(process.execPath, [mainFile], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: process.env.PORT || '3000',
    },
  });

  serverProcess = child;

  child.on('error', (error) => {
    log(`Failed to start API: ${error.message}`);
  });

  child.on('exit', (code, signal) => {
    if (serverProcess === child) {
      serverProcess = null;
    }

    if (!isShuttingDown && code !== 0 && signal !== 'SIGTERM') {
      log(`API exited. Code: ${code}, Signal: ${signal}`);
    }
  });
}

// Restart only after a successful Webpack compilation.
function restartServer() {
  restartQueue = restartQueue
    .then(async () => {
      if (isShuttingDown) return;

      log('Stopping previous API process...');

      await stopServer();

      if (!isShuttingDown) {
        startServer();
      }
    })
    .catch((error) => {
      log(`Restart failed: ${error.message}`);
    });

  return restartQueue;
}

// Initialize Webpack watch mode.
async function startWatcher() {
  log('Initializing Nx project graph...');
  await createProjectGraphAsync();

  log('Starting Webpack watcher...');

  const config = require(webpackConfigPath);

  config.watchOptions = {
    ...config.watchOptions,
    poll: POLL_INTERVAL,
    aggregateTimeout: 300,
    ignored: ['**/node_modules/**', '**/.git/**'],
  };

  const compiler = webpack(config);

  watcher = compiler.watch(
    config.watchOptions,
    async (error, stats) => {
      if (isShuttingDown) return;

      if (error) {
        log(`Webpack error: ${error.message}`);
        return;
      }

      if (!stats) return;

      if (stats.hasErrors()) {
        log('Build failed. Keeping the previous API process running.');

        console.error(
          stats.toString({
            all: false,
            errors: true,
            errorDetails: true,
            warnings: true,
          }),
        );

        return;
      }

      log(
        stats.hash
          ? `Build successful (${stats.hash.slice(0, 8)})`
          : 'Build successful',
      );

      if (!require('node:fs').existsSync(mainFile)) {
        log(`Output file not found: ${mainFile}`);
        return;
      }

      await restartServer();
    },
  );
}

// Graceful shutdown.
async function shutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;
  log(`Received ${signal}. Shutting down...`);

  if (watcher) {
    await new Promise((resolve) => watcher.close(resolve));
  }

  await restartQueue;
  await stopServer();

  log('Shutdown complete.');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  console.error('[dev-watch] Uncaught exception:', error);
  shutdown('uncaughtException');
});

startWatcher().catch((error) => {
  console.error('[dev-watch] Fatal error:', error);
  process.exit(1);
});
