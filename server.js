const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();
const PORT = 3000;

// -------------------
// MIDDLEWARES
// -------------------
app.use(cors());
app.use(express.json());

app.use(session({
  secret: "jadda_secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// 🚫 Evitar que el navegador guarde copias de las páginas protegidas
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// -------------------
// ARCHIVOS ESTÁTICOS
// -------------------
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "principal.html"));
});

// -------------------
// MYSQL
// -------------------
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tienda_deportiva'
});

db.connect(err => {
  if (err) return console.error("❌ Error DB:", err.message);
  console.log("✅ MySQL conectado");
});

// -------------------
// EMAIL (ENV)
// -------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -------------------
// GOOGLE LOGIN
// -------------------
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {

  const email = profile.emails[0].value;
  const nombre = profile.displayName;
  const usuarioNick = email.split("@")[0];

  db.query("SELECT * FROM USUARIOS WHERE EMAIL = ?", [email], (err, result) => {

    if (err) return done(err);

    if (result.length === 0) {

      const insert = `
      INSERT INTO USUARIOS
      (NOMBRE_USUARIO, APELLIDO_USUARIO, EMAIL, USUARIO, CONTRASENA, TELEFONO, DIRECCION, FECHA_REGISTRO, ID_ROL, CONFIRMADO)
      VALUES (?, ?, ?, ?, 'google', 'N/A', 'N/A', CURDATE(), 2, 1)
      `;

      db.query(insert, [nombre, "Google", email, usuarioNick], () => {
        return done(null, { nombre, email });
      });

    } else {
      return done(null, {
        nombre: result[0].NOMBRE_USUARIO,
        email: result[0].EMAIL
      });
    }

  });

}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// -------------------
// GOOGLE ROUTES
// -------------------
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err || !user) return res.redirect('/html/inicio.html');

    req.logIn(user, (err2) => {
      if (err2) return res.send("Error sesión");

      // 🔥 CAMBIO AQUÍ: Pasamos el nombre en la URL para que el frontend lo capture
      const nombreCodificado = encodeURIComponent(user.nombre);
      return res.redirect(`/html/principal.html?user=${nombreCodificado}`);
    });
  })(req, res, next);
});

// -------------------
// REGISTRO + EMAIL
// -------------------
app.post('/api/registro', async (req, res) => {

  const { nombre, apellido, email, password, telefono, direccion } = req.body;

  const usuarioNick = email.split('@')[0];
  const token = crypto.randomBytes(32).toString("hex");

  try {

    const hashed = await bcrypt.hash(password, 10);

    const sql = `
    INSERT INTO USUARIOS 
    (NOMBRE_USUARIO, APELLIDO_USUARIO, EMAIL, USUARIO, CONTRASENA, FECHA_REGISTRO, ID_ROL, TELEFONO, DIRECCION, CONFIRMADO, TOKEN)
    VALUES (?, ?, ?, ?, ?, CURDATE(), 2, ?, ?, 0, ?)
    `;

    db.query(sql, [nombre, apellido, email, usuarioNick, hashed, telefono, direccion, token], (err) => {

      if (err) {
        // 🚨 Detectamos si el correo ya existe en la DB
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send("Este correo ya está registrado. Intenta iniciar sesión.");
        }
        return res.status(500).send("Error al registrar en la base de datos.");
      }

      const link = `http://localhost:3000/confirmar/${token}`;

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirma tu cuenta - JADA SPORTS",
        html: `
<div style="font-family: Arial; background:#f5f5f5; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
    
    <div style="background:#e73737; color:white; padding:15px; text-align:center;">
      <h2>JADDA SPORTS</h2>
    </div>

    <div style="padding:20px; text-align:center;">
      <h3>Confirma tu cuenta</h3>
      <p>Gracias por registrarte en JADDA SPORTS.</p>
      <p>Haz clic en el botón para activar tu cuenta:</p>

      <a href="${link}" 
         style="display:inline-block; padding:12px 20px; background:#0055aa; color:white; text-decoration:none; border-radius:5px;">
         CONFIRMAR CUENTA
      </a>

      <p style="margin-top:20px; font-size:12px; color:gray;">
        Si no creaste esta cuenta, puedes ignorar este mensaje.
      </p>
    </div>

    <div style="background:#003366; color:white; text-align:center; padding:10px;">
      © 2025 JADDA SPORTS
    </div>

  </div>
</div>
`
      });

      res.send("Revisa tu correo 📩");
    });

  } catch {
    res.status(500).send("Error servidor");
  }

});

// -------------------
// CONFIRMAR
// -------------------
app.get('/confirmar/:token', (req, res) => {

  const { token } = req.params;

  db.query("UPDATE USUARIOS SET CONFIRMADO = 1, TOKEN = NULL WHERE TOKEN = ?", [token], (err, result) => {

    if (err || result.affectedRows === 0) {
      return res.send("Token inválido");
    }

    res.redirect('/html/confirmado.html');

  });

});

// -------------------
// LOGIN JWT
// -------------------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM USUARIOS WHERE EMAIL = ?", [email], async (err, results) => {
    if (err) return res.status(500).send("Error BD");

    if (results.length === 0) {
      return res.status(401).send("Correo o contraseña incorrectos");
    }

    const user = results[0];

    if (user.CONFIRMADO === 0) {
      return res.status(403).send("Debes verificar tu correo antes de iniciar sesión");
    }

    const match = await bcrypt.compare(password, user.CONTRASENA);
    if (!match) {
      return res.status(401).send("Correo o contraseña incorrectos");
    }

    const token = jwt.sign(
      { id: user.ID_USUARIO },
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "2h" }
    );

    res.json({ 
      token, 
      nombre: user.NOMBRE_USUARIO
    });
  });   
});     


// -------------------
// PROTEGER RUTAS
// -------------------
function verificarToken(req, res, next) {

  const token = req.headers['authorization'];

  if (!token) return res.status(401).send("Token requerido");

  jwt.verify(token, process.env.JWT_SECRET || "secreto", (err, decoded) => {

    if (err) return res.status(403).send("Token inválido");

    req.user = decoded;
    next();

  });

}

// -------------------
// PRODUCTOS (PROTEGIDO)
// -------------------
app.get('/api/productos', (req, res) => {
  db.query("SELECT * FROM PRODUCTOS", (err, results) => {
    if (err) return res.status(500).send("Error BD");
    res.json(results);
  });
});

// -------------------
// LOGOUT
// -------------------
app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/html/principal.html');
    });
  });
});

// -------------------
// ruta
// -------------------
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  } else {
    return res.status(401).send("No autenticado");
  }
});

// -------------------
// CONFIRMAR correo
// -------------------
app.get('/api/confirmar', (req, res) => {

  const token = req.query.token;

  if (!token) {
    return res.send("Token inválido");
  }

  db.query("SELECT * FROM USUARIOS WHERE TOKEN = ?", [token], (err, results) => {

    if (err) return res.send("Error en BD");

    if (results.length === 0) {
      return res.send("Token inválido");
    }

    // ✅ Confirmar usuario
    db.query("UPDATE USUARIOS SET CONFIRMADO = 1 WHERE TOKEN = ?", [token], (err) => {

      if (err) return res.send("Error al confirmar");

      // 🔥 Redirige a una página bonita
      res.redirect("/html/confirmado.html");
    });

  });

});


// -------------------
// RECUPERAR CONTRASEÑA
// -------------------
app.post('/api/recuperar-password', (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString("hex");

    // 1. Buscamos si el usuario existe
    db.query("SELECT * FROM USUARIOS WHERE EMAIL = ?", [email], (err, results) => {
        if (err) return res.status(500).send("Error BD");
        
        if (results.length > 0) {
            
            db.query("UPDATE USUARIOS SET TOKEN = ? WHERE EMAIL = ?", [token, email], (err2) => {
                if (err2) return res.status(500).send("Error al generar token");

                // 3. Enviamos el mail con el link a una página de "reset"
                const link = `http://localhost:3000/html/reset-password.html?token=${token}`;
                
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Restablecer Contraseña - JADDA SPORTS",
                    html: `
                        <div style="font-family: Arial; padding:20px; border: 1px solid #ddd;">
                            <h2 style="color: #e73737;">JADDA SPORTS</h2>
                            <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo:</p>
                            <a href="${link}" style="background: #0055aa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                RESTABLECER CONTRASEÑA
                            </a>
                            <p>Si no solicitaste esto, ignora este correo.</p>
                        </div>
                    `
                });
            });
        }
        // Respondemos 200 siempre por seguridad (evita enumeración de correos)
        res.send("Proceso iniciado");
    });
});


// -------------------
// ACTUALIZAR CONTRASEÑA (RESET)
// -------------------
app.post('/api/update-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token) return res.status(400).send("Token requerido");

    try {
        // 1. Cambiamos ID por ID_USUARIO que es como lo tienes en el Login
        db.query("SELECT ID_USUARIO, CONTRASENA FROM USUARIOS WHERE TOKEN = ?", [token], async (err, results) => {
            if (err) {
                console.error("Error en SELECT:", err);
                return res.status(500).send("Error en la base de datos");
            }
            
            if (results.length === 0) {
                return res.status(400).send("El enlace ha expirado o es inválido.");
            }

            // 2. Usamos ID_USUARIO aquí también
            const usuarioId = results[0].ID_USUARIO; 
            const passwordActual = results[0].CONTRASENA;

            // 3. Comparación
            const esIgual = await bcrypt.compare(password, passwordActual);
            if (esIgual) {
                return res.status(409).send("La nueva contraseña no puede ser igual a la anterior.");
            }

            // 4. Encriptar
            const hashed = await bcrypt.hash(password, 10);
            
            // 5. UPDATE usando ID_USUARIO
            const sqlUpdate = "UPDATE USUARIOS SET CONTRASENA = ?, TOKEN = NULL WHERE ID_USUARIO = ?";
            
            db.query(sqlUpdate, [hashed, usuarioId], (err2, result) => {
                if (err2) {
                    console.error("Error en UPDATE:", err2);
                    return res.status(500).send("Error al actualizar la contraseña");
                }

                if (result.affectedRows === 0) {
                    return res.status(400).send("No se pudo actualizar. Inténtalo de nuevo.");
                }

                res.send("Contraseña actualizada con éxito");
            });
        });
    } catch (error) {
        console.error("Error catch:", error);
        res.status(500).send("Error interno del servidor");
    }
});



// -------------------
// SERVIDOR
// -------------------
app.listen(PORT, () => {
  console.log("🚀 Servidor en http://localhost:" + PORT);
});