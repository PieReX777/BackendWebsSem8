import jwt from "jsonwebtoken";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";

const { user: User, role: Role } = db;

/**
 * Middleware para verificar la validez del token JWT en las solicitudes entrantes.
 */
export const verifyToken = async (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "¡No se proporcionó un token!" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), authConfig.secret);
        req.userId = decoded.id;

        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(401).json({ message: "¡No autorizado!" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "¡No autorizado!", error: error.message });
    }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'admin'.
 */
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();
        const isAdmin = roles.some((role) => role.name === "admin");

        if (isAdmin) {
            return next();
        }

        return res.status(403).json({ message: "¡Se requiere el rol de admin!" });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'moderator'.
 */
export const isModerator = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();
        const isModerator = roles.some((role) => role.name === "moderator");

        if (isModerator) {
            return next();
        }

        return res.status(403).json({ message: "¡Se requiere el rol de moderador!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'admin' o 'moderator'.
 */
export const isModeratorOrAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();
        const hasRole = roles.some((role) => ["admin", "moderator"].includes(role.name));

        if (hasRole) {
            return next();
        }

        return res.status(403).json({ message: "¡Se requiere el rol de administrador o moderador!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};