const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Servir o frontend (HTML, CSS, JS)

const db = mysql.createConnection({
  host: "localhost",
  user: "root",       
  password: "123456",       
  database: "plataforma_cursos"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL!");
  }
});



app.get("/api/materias", (req, res) => {
  db.query("SELECT * FROM materias", (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    res.json(results);
  });
});

app.post("/api/materias", (req, res) => {
  const { nome } = req.body;
  db.query("INSERT INTO materias (nome) VALUES (?)", [nome], (err, result) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ id: result.insertId, nome });
  });
});

app.get("/api/aulas", (req, res) => {
  db.query("SELECT * FROM aulas", (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    res.json(results);
  });
});

app.post("/api/aulas", (req, res) => {
  const { titulo, descricao, data_aula, id_materia } = req.body;
  db.query(
    "INSERT INTO aulas (titulo, descricao, data_aula, id_materia) VALUES (?, ?, ?, ?)",
    [titulo, descricao, data_aula, id_materia],
    (err, result) => {
      if (err) return res.status(500).json({ erro: err });
      res.json({ id: result.insertId, titulo });
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:$8080`);
});
