const jwt = require('jsonwebtoken');

function getAdminTokenFromRequest(req) {
  const explicitToken = String(req.headers['x-admin-token'] || '').trim();
  if (explicitToken) {
    return explicitToken;
  }

  return '';
}

function getBearerTokenFromRequest(req) {
  const authorization = String(req.headers.authorization || '').trim();
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return '';
}

function hasAdminRole(claims) {
  const role = String(claims?.role || claims?.user?.role || '').toLowerCase();
  if (role === 'admin') {
    return true;
  }

  if (Array.isArray(claims?.roles)) {
    return claims.roles.some((entry) => String(entry || '').toLowerCase() === 'admin');
  }

  return false;
}

function getVerifiedBearerClaims(req) {
  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    return null;
  }

  const bearerToken = getBearerTokenFromRequest(req);
  if (!bearerToken) {
    return null;
  }

  try {
    return jwt.verify(bearerToken, jwtSecret);
  } catch (_error) {
    return null;
  }
}

function requireAdminAuthIfConfigured(req, res, next) {
  const isReadOnlyMethod = ['GET', 'HEAD', 'OPTIONS'].includes(String(req.method || '').toUpperCase());
  if (isReadOnlyMethod) {
    return next();
  }

  const configuredToken = String(process.env.ADMIN_API_TOKEN || '').trim();
  const hasJwtSecret = Boolean(String(process.env.JWT_SECRET || '').trim());
  const verifiedClaims = getVerifiedBearerClaims(req);

  if (hasAdminRole(verifiedClaims)) {
    return next();
  }

  if (configuredToken) {
    const providedToken = getAdminTokenFromRequest(req);
    if (providedToken && providedToken === configuredToken) {
      return next();
    }
  }

  if (!configuredToken && !hasJwtSecret) {
    return res.status(500).json({ error: 'Server misconfiguration: ADMIN_API_TOKEN or JWT_SECRET is not set' });
  }

  return res.status(401).json({ error: 'Unauthorized: admin role or valid admin token required' });
}

module.exports = {
  requireAdminAuthIfConfigured,
};
