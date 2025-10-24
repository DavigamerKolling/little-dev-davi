const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 8080;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "plataforma_cursos"
});

db.connect((err) => {
  if (err) console.error("❌ Erro ao conectar ao MySQL:", err);
  else console.log("✅ Conectado ao MySQL!");
});

app.get("/api/materias", (req, res) => {
  const sql = "SELECT id_materia, nome, imagem, mimetype FROM materias";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });

    const materias = results.map((m) => ({
      id_materia: m.id_materia,
      nome: m.nome,
      imagem: m.imagem ? `data:${m.mime_type};base64,${m.imagem.toString("base64")}` : null
    }));

    res.json(materias);
  });
});

app.post("/api/materias", upload.single("imagem"), (req, res) => {
  const { nome } = req.body;
  const imagem = req.file?.buffer;
  const mimetype = req.file?.mimetype;

  if (!nome || !imagem || !mimetype) {
    return res.status(400).json({ erro: "Nome e imagem são obrigatórios" });
  }

  const sql = "INSERT INTO materias (nome, imagem, mimetype) VALUES (?, ?, ?)";
  db.query(sql, [nome, imagem, mimetype], (err, result) => {
    if (err) {
      console.error("Erro ao inserir matéria:", err);
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ id_materia: result.insertId, nome });
  });
});

app.get("/api/aulas", (req, res) => {
  db.query("SELECT * FROM aulas", (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

app.post("/api/aulas", (req, res) => {
  const { titulo, descricao, data_aula, id_materia } = req.body;
  const sql = "INSERT INTO aulas (titulo, descricao, data_aula, id_materia) VALUES (?, ?, ?, ?)";
  db.query(sql, [titulo, descricao, data_aula, id_materia], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ id: result.insertId, titulo });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});

app.delete("/api/materias/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM materias WHERE id_materia = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ message: "Matéria excluída com sucesso!" });
  });
});
