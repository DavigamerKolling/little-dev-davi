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

const UPLOADS_DIR = path.join(__dirname, 'uploads');


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
      imagem: m.imagem ? `data:${m.mimetype};base64,${m.imagem.toString("base64")}` : null
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

app.delete("/api/materias/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM materias WHERE id_materia = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ erro: "Matéria não encontrada." });
    res.json({ message: "Matéria excluída com sucesso!" });
  });
});

app.post("/api/materiais", (req, res) => {
  const { titulo, tipo, id_materia, arquivo } = req.body;
  
  if (!titulo || !tipo || !id_materia || !arquivo) {
    return res.status(400).json({ erro: "Todos os campos (Título, Tipo, Matéria, Arquivo) são obrigatórios." });
  }
  
  const sql = "INSERT INTO materiais (titulo, tipo, id_materia, arquivo) VALUES (?, ?, ?, ?)";
  db.query(sql, [titulo, tipo, id_materia, arquivo], (err, result) => {
    if (err) {
      console.error("Erro ao inserir material:", err);
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ id_material: result.insertId, titulo });
  });
});

app.get("/api/materiais", (req, res) => {
  const { id_materia } = req.query;
  
  let sql = "SELECT m.id_material, m.titulo, m.tipo, m.arquivo, m.id_materia, t.nome as nome_materia FROM materiais m JOIN materias t ON m.id_materia = t.id_materia";
  let params = [];

  if (id_materia) {
    sql += " WHERE m.id_materia = ?";
    params.push(id_materia);
  }
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

app.get("/api/materiais/download/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT arquivo FROM materiais WHERE id_material = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao buscar nome do arquivo:", err);
      return res.status(500).json({ erro: "Erro no servidor ao buscar arquivo." });
    }
    if (result.length === 0) {
      return res.status(404).json({ erro: "Material não encontrado." });
    }

    const nomeArquivo = result[0].arquivo;
    if (!nomeArquivo) {
      return res.status(404).json({ erro: "Nome de arquivo não encontrado para este material." });
    }
    
    const caminhoCompleto = path.join(UPLOADS_DIR, nomeArquivo);

    res.download(caminhoCompleto, nomeArquivo, (err) => {
      if (err) {
        console.error(`❌ Erro ao enviar arquivo (${nomeArquivo}):`, err.message);
        res.status(404).json({ erro: `Arquivo não encontrado no servidor: ${nomeArquivo}. Certifique-se de que a pasta 'uploads' e o arquivo existem.` });
      } else {
        console.log(`✅ Arquivo ${nomeArquivo} enviado com sucesso.`);
      }
    });
  });
});

app.get("/api/materiais/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT id_material, titulo, tipo, arquivo, id_materia FROM materiais WHERE id_material = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.length === 0) return res.status(404).json({ erro: "Material não encontrado." });
        res.json(result[0]);
    });
});

app.put("/api/materiais/:id", (req, res) => {
    const id = req.params.id;
    const { titulo, tipo, id_materia, arquivo } = req.body;

    if (!titulo || !tipo || !id_materia || !arquivo) {
        return res.status(400).json({ erro: "Todos os campos (Título, Tipo, Matéria, Arquivo) são obrigatórios para atualização." });
    }

    const sql = "UPDATE materiais SET titulo = ?, tipo = ?, id_materia = ?, arquivo = ? WHERE id_material = ?";
    db.query(sql, [titulo, tipo, id_materia, arquivo, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar material:", err);
            return res.status(500).json({ erro: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ erro: "Material não encontrado." });
        res.json({ id_material: id, titulo, message: "Material atualizado com sucesso!" });
    });
});

app.delete("/api/materiais/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM materiais WHERE id_material = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ erro: "Material não encontrado." });
    res.json({ message: "Material excluído com sucesso!" });
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

// Rota principal (mantida)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});