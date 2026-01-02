import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Configuration
// Prefer explicit SUPABASE_URL / SUPABASE_KEY env vars. Fall back to common Vite names if present.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hpudpcwmqmquwdcnbfni.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
    console.error('ERROR: SUPABASE_KEY (server-side) environment variable not set or invalid.\n- Server requires a valid Supabase key (service_role or anon depending on usage).\n- Do NOT expose service_role key in client-side code.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3000;

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Get all content
app.get('/api/content', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get content by board and class
app.get('/api/content/:board/:class', async (req, res) => {
    try {
        const { board, class: cls } = req.params;
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('board', board)
            .eq('class', cls)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create content (Admin only)
app.post('/api/content', async (req, res) => {
    try {
        const { adminToken } = req.headers;
        
        // Validate admin token (implement your own auth logic)
        if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const content = req.body;
        content.timestamp = new Date().toISOString();

        const { data, error } = await supabase
            .from('content')
            .insert([content]);

        if (error) throw error;
        res.json({ success: true, data, message: 'Content created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete content (Admin only)
app.delete('/api/content/:id', async (req, res) => {
    try {
        const { adminToken } = req.headers;
        
        // Validate admin token
        if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;

        // Get content to check for storage file
        const { data: contentData } = await supabase
            .from('content')
            .select('storagePath')
            .eq('id', id)
            .single();

        // Delete from storage if it exists
        if (contentData && contentData.storagePath) {
            await supabase.storage
                .from('content-files')
                .remove([contentData.storagePath]);
        }

        // Delete from database
        const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload file to storage (Admin only)
app.post('/api/upload', async (req, res) => {
    try {
        const { adminToken } = req.headers;
        
        // Validate admin token
        if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { fileName, fileContent, bucket = 'content-files' } = req.body;

        if (!fileName || !fileContent) {
            return res.status(400).json({ success: false, error: 'Missing fileName or fileContent' });
        }

        const timestamp = Date.now();
        const storagePath = `${timestamp}-${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, Buffer.from(fileContent, 'base64'), {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from(bucket)
            .getPublicUrl(storagePath);

        res.json({
            success: true,
            fileName,
            storagePath,
            publicUrl: publicUrl.publicUrl
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quotes
app.get('/api/quotes', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('type', 'quote');

        if (error) throw error;

        if (data.length === 0) {
            return res.json({
                success: true,
                quote: '✨ Welcome to Ideal Classes - Excellence in Education!'
            });
        }

        const randomQuote = data[Math.floor(Math.random() * data.length)];
        res.json({ success: true, quote: randomQuote.title });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Supabase URL: ${supabaseUrl}`);
    console.log(`🔐 Admin authentication enabled`);
});

export default app;
