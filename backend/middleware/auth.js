import jwt from 'jsonwebtoken';

// Temporary mock authentication for development
// Replace with real JWT authentication in production
export const authenticateToken = (req, res, next) => {
    // For now, use a demo user ID
    // In production, extract from JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // For development: create demo user with ID 1
        req.userId = 1;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        // Fallback to demo user for development
        req.userId = 1;
        next();
    }
};

// Optional: Real JWT authentication (uncomment when ready to use)
/*
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};
*/
