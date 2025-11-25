import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, '..', 'data');

// Habilita CORS. Em produção defina CORS_ORIGIN para o domínio do front (ex: https://meu-site.vercel.app).
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.options('*', cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado');

    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext);

    let sanitizedBase = baseName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const charMap = {
      'ß': 'ss', 'Æ': 'AE', 'æ': 'ae', 'Œ': 'OE', 'œ': 'oe', 'ø': 'o', 'Ø': 'O',
      'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D'
    };
    sanitizedBase = sanitizedBase.replace(/[^\u0000-\u007F]/g, (ch) => charMap[ch] ?? '');

    sanitizedBase = sanitizedBase.replace(/\s+/g, '_');

    sanitizedBase = sanitizedBase.replace(/[^a-zA-Z0-9-_]/g, '');

    const safeName = `${sanitizedBase}${ext}`.toLowerCase();

    if (ext !== '.csv') {
      return res.status(415).send('Apenas arquivos .csv são aceitos');
    }

    await fs.mkdir(DATA_DIR, { recursive: true });

    const destPath = path.join(DATA_DIR, safeName);

    let existed = false;
    try {
      await fs.access(destPath);
      existed = true;
    } catch (err) {
      existed = false;
    }

    await fs.writeFile(destPath, req.file.buffer);

    return res.json({ ok: true, filename: safeName, overwritten: existed });
  } catch (err) {
    console.error('Erro no upload:', err);
    return res.status(500).send('Erro interno no servidor');
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const clientDist = path.resolve(__dirname, '..', 'dist');

// Expor a pasta de dados em /data para que o frontend possa buscar os CSVs
app.use('/data', express.static(DATA_DIR));

app.use(express.static(clientDist));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).send('Not Found');

  const indexPath = path.join(clientDist, 'index.html');
  return res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Erro ao servir o aplicativo');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
