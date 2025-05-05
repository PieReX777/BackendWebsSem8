import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authConfig from "../config/auth.config.js";

const { user: User, role: Role } = db;

/**
 * Controlador para el registro de usuarios
 */
export const signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    // Crear el usuario
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Asignar roles
    if (roles && roles.length > 0) {
      const foundRoles = await Role.findAll({ where: { name: roles } });
      await user.setRoles(foundRoles);
    } else {
      // Rol por defecto: 'user'
      await user.setRoles([1]); // Asumiendo que el ID del rol 'user' es 1
    }

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controlador para el inicio de sesión
 */
export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario incluyendo sus roles
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Role,
        as: "roles",
        through: { attributes: [] } // Excluir tabla intermedia
      }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validar contraseña
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    // Generar token
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400 // 24 horas
    });

    // Preparar roles para la respuesta
    const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    // Enviar respuesta
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};