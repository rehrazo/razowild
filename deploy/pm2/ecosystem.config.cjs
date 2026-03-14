module.exports = {
  apps: [
    {
      name: 'razowild-api',
      cwd: '/var/www/razowild/backend',
      script: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'razowild-storefront',
      cwd: '/var/www/razowild/frontend',
      script: 'npm',
      args: 'run preview -- --host 127.0.0.1 --port 3000 --strictPort',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'razowild-admin',
      cwd: '/var/www/razowild/frontend',
      script: 'npm',
      args: 'run preview -- --host 127.0.0.1 --port 3001 --strictPort',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
