import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import Note from '../models/Note.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Clients (lazy; requires GEMINI_API_KEY)
const getGemini = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return {
    genAI: new GoogleGenerativeAI(key),
    fileManager: new GoogleAIFileManager(key),
  };
};

export const summarizeUpload = async (req, res) => {
  try {
    const clients = getGemini();
    if (!clients) {
      return res.status(503).json({ success: false, message: 'AI summarization is not configured. Set GEMINI_API_KEY on the server.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }
    const { genAI, fileManager } = clients;
    const filePath = req.file.path;
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: 'application/pdf',
      displayName: req.file.originalname,
    });
    // Clean up temp file after upload
    fs.unlink(filePath, () => {});
    const prompt = 'Act as an expert university tutor. Extract the core concepts, key formulas, and an executive summary from this document. Format the response clearly.';
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const response = await model.generateContent([
      { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
      { text: prompt },
    ]);
    res.status(200).json({
      success: true,
      data: { noteTitle: req.file.originalname, summaryText: response.response.text() },
    });
  } catch (error) {
    console.error('AI Upload Summarization Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const summarizeNote = async (req, res) => {
  try {
    const clients = getGemini();
    if (!clients) {
      return res.status(503).json({
        success: false,
        message: 'AI summarization is not configured. Set GEMINI_API_KEY on the server.',
      });
    }
    const { genAI, fileManager } = clients;

    const noteId = req.params.noteId;
    
    // 1. Fetch the note record from DB
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // 2. Construct absolute path to the uploaded PDF (FileURL is like "/uploads/file.pdf")
    const relativePath = note.FileURL.replace(/^\/+/, '');
    const filePath = path.join(__dirname, '..', relativePath);

    // 3. Verify file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Source PDF file not found on server' });
    }

    // 4. Upload the file to Gemini's File API for processing using the File Manager
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: 'application/pdf',
      displayName: note.Title,
    });

    // 5. Generate content using the uploaded file reference
    const prompt = 'Act as an expert university tutor. Extract the core concepts, key formulas, and an executive summary from this document. Format the response clearly.';
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Generate content using the file URI and the prompt
    const response = await model.generateContent([
        {
            fileData: {
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri
            }
        },
        { text: prompt }
    ]);

    // 6. Return the generated summary
    res.status(200).json({ 
      success: true, 
      data: {
        noteTitle: note.Title,
        summaryText: response.response.text()
      } 
    });

  } catch (error) {
    console.error('AI Summarization Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
