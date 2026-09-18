// backend/middleware/authMiddleware.js
//
// Protects routes that need a signed-in user (history, analytics, account).
// Verifies a JWT and attaches { id, email } to req.user so downstream
// controllers can do things like `Scan.find({ userId: req.user.id })`.
//
// Assumes:
//   - routes/auth.js signs a JWT on login/Google callback with
//       jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
//     and sets it as an httpOnly cookie named "token" — which is why the
//     frontend fetch calls use `credentials: 'include'` rather than
//     manually attaching a header.
//   - process.env.JWT_SECRET is set (see config/db.js's neighbour, a
//     .env file — never commit the real secret).
//
// Also exported: optionalAuth, for routes that behave differently when
// signed in but shouldn't hard-fail when signed out (e.g. create.html's
// preview working for guests, saving only for signed-in users).

const jwt = require('jsonwebtoken');

// Pull the token from wherever the frontend put it: cookie first
// (the default for this app), Authorization header as a fallback.
function extractToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

// Required auth — blocks the request with 401 if there's no valid token.
function authMiddleware(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Sign in to do that.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Sign in again.'
        : 'That session is not valid. Sign in again.';
    return res.status(401).json({ message });
  }
}

// Optional auth — attaches req.user when a valid token is present,
// but never blocks the request. Use for routes that work for guests
// too but personalize when someone's signed in.
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
  } catch (err) {
    // Invalid or expired token on an optional route — proceed as a guest
    // rather than failing the request.
  }
  next();
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuth = optionalAuth;