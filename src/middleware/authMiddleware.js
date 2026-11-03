const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const { HttpError } = require('../utils/http');
module.exports = async (req, _res, next) => {
 const bearer = req.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
 const token = bearer || req.cookies?.session;
 if (!token) throw new HttpError(401, 'Sign in to continue');
 let decoded;
 try { decoded = jwt.verify(token, req.app.locals.config.JWT_SECRET, { algorithms: ['HS256'] }); }
 catch { throw new HttpError(401, 'Session expired or invalid'); }
 const session = await Session.findOne({ _id: decoded.jti, user: decoded.id, expiresAt: { $gt: new Date() } });
 if (!session) throw new HttpError(401, 'Session expired or revoked');
 req.user = await User.findById(decoded.id);
 if (!req.user) throw new HttpError(401, 'Account no longer exists');
 if (!bearer && !['GET','HEAD','OPTIONS'].includes(req.method) && req.get('x-csrf-token') !== session.csrf) throw new HttpError(403, 'Invalid CSRF token');
 req.session = session; next();
};
