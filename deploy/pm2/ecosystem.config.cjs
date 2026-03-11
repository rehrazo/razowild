module.exports = {
  apps: [
    {
      name: 'camptime-api',
      cwd: '/var/www/camptime/backend',
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
      name: 'camptime-storefront',
      cwd: '/var/www/camptime/frontend',
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
      name: 'camptime-admin',
      cwd: '/var/www/camptime/frontend',
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
