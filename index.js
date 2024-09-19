const express = require('express');
const mysql2 = require('mysql2');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Usa a variável de ambiente do Railway ou padrão 3000

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Conexão ao banco de dados MySQL
const mysqli = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());
app.use(express.static('public')); // Serve arquivos estáticos do diretório 'public'

// Rota para obter arquivos
app.get('/arquivo', (req, res) => {
    const sql = 'SELECT id_arquivo, nome_arquivo, download_arquivo, tipo FROM arquivo';
    mysqli.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao consultar dados: ', err);
            return res.status(500).json({ success: false, message: 'Erro ao consultar o banco' });
        }
        res.json(result);
    });
});

// Rota para upload de arquivos
app.post('/upload', upload.single('download_arquivo'), (req, res) => {
    const { nome_arquivo } = req.body;
    const download_arquivo = req.file ? req.file.buffer : null;
    const tipo = req.file ? req.file.mimetype : null;

    if (!nome_arquivo || !download_arquivo) {
        return res.status(400).json({ success: false, message: 'Nome do arquivo e arquivo são obrigatórios' });
    }

    const sql = 'INSERT INTO arquivo (nome_arquivo, download_arquivo, tipo) VALUES (?, ?, ?)';
    mysqli.query(sql, [nome_arquivo, download_arquivo, tipo], (err) => {
        if (err) {
            console.error('Erro ao inserir dados: ', err);
            return res.status(500).json({ success: false, message: 'Erro ao dar insert' });
        }
        res.redirect('/teste.html'); // Redireciona após o upload
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
