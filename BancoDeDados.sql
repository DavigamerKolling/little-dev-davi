CREATE DATABASE plataforma_cursos;
USE plataforma_cursos;

CREATE TABLE materias (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    imagem LONGBLOB NOT NULL,
    mimetype VARCHAR(50) NOT NULL
);

CREATE TABLE aulas (
    id_aula INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_aula DATE,
    id_materia INT,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
);

CREATE TABLE materiais (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    tipo ENUM('slide','artigo','livro') NOT NULL,
    arquivo VARCHAR(255), -- caminho ou nome do arquivo
    id_materia INT,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
);

CREATE TABLE eventos (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_evento DATE,
    id_materia INT,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
);

INSERT INTO materias (nome, imagem, mimetype)
VALUES
('Português', '', 'image/png'),
('Matemática', '', 'image/jpeg'),
('Biologia', '', 'image/png'),
('Química', '', 'image/jpeg'),
('Física', '', 'image/jpeg'),
('Inglês', '', 'image/jpeg'),
('História', '', 'image/jpeg'),
('Geografia', '', 'image/jpeg'),
('Educação Física', '', 'image/jpeg');
