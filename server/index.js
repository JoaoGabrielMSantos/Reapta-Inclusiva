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
    let existingMtime = null;
    try {
      await fs.access(destPath);
      existed = true;
      const st = await fs.stat(destPath);
      existingMtime = st.mtimeMs || st.ctimeMs || null;
    } catch (err) {
      existed = false;
    }

    // Allow client to provide upload timestamp; otherwise use server time
    let uploadTime = Date.now();
    try {
      if (req.body && req.body.uploadedAt) {
        const parsed = Date.parse(req.body.uploadedAt);
        if (!Number.isNaN(parsed)) uploadTime = parsed;
      }
    } catch (e) {
      // ignore and use server time
    }

    // Only overwrite if file doesn't exist or the incoming upload is newer (by uploadedAt)
    let didWrite = false;
    if (!existed || uploadTime >= (existingMtime || 0)) {
      await fs.writeFile(destPath, req.file.buffer);
      // try to set mtime to the upload time so future comparisons use it
      try {
        const seconds = Math.floor(uploadTime / 1000);
        await fs.utimes(destPath, seconds, seconds);
      } catch (e) {
        // ignore utimes errors
      }
      didWrite = true;
    }

    return res.json({ ok: true, filename: safeName, overwritten: didWrite, existed, path: `/data/${safeName}`, uploadedAt: new Date(uploadTime).toISOString(), previousMtime: existingMtime ? new Date(existingMtime).toISOString() : null });
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
