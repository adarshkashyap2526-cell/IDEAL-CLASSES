# Supabase Storage Setup Guide

## Overview
The IDEAL CLASSES application now includes Supabase Storage integration for uploading and serving files directly from your Supabase project.

## Features Added
✅ **File Upload**: Upload PDF notes, documents, images, and videos directly to Supabase Storage  
✅ **File Management**: Delete uploaded files from storage  
✅ **Public Access**: Files are served as public URLs for quick access  
✅ **File Size Validation**: Max 50MB per file  
✅ **File Tracking**: Metadata stored in database (filename, storage path, upload timestamp)  

## Setup Instructions

### 1. Create Supabase Storage Bucket

Go to your [Supabase Dashboard](https://app.supabase.com):

1. Click on **Storage** in the left sidebar
2. Click **Create new bucket**
3. Name it: `content-files`
4. Choose **Public** access (so files are publicly accessible)
5. Click **Create bucket**

### 2. Update Database Schema (Optional but Recommended)

Add the following columns to your `content` table if they don't exist:

```sql
ALTER TABLE content ADD COLUMN IF NOT EXISTS isStorageFile BOOLEAN DEFAULT false;
ALTER TABLE content ADD COLUMN IF NOT EXISTS fileName TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS storagePath TEXT;
```

### 3. Update RLS Policies

Go to **Storage > Policies** in your Supabase Dashboard:

**For Public Read Access (Viewers can download):**
```sql
(bucket_id = 'content-files')
```

**For Public Upload Access (Admins can upload):**
For authenticated admins only, create a policy:
```sql
(bucket_id = 'content-files' AND auth.uid() = auth.uid())
```

## How to Use

### For Admins (Upload Content)

1. Go to **Admin Dashboard**
2. Select Content Type, Board, Class, and Title
3. **Option A**: Paste a link (external Google Form, Drive link, etc.)
4. **Option B**: Upload a file directly using the file picker
5. Click **Upload Content**

### Supported File Types
- 📄 PDF (`.pdf`)
- 📝 Documents (`.doc`, `.docx`)
- 🖼️ Images (`.jpg`, `.jpeg`, `.png`)
- 🎥 Videos (`.mp4`)
- 📦 Archives (`.zip`)
- **Max size**: 50MB per file

### For Students (Download Content)

1. Navigate to Board → Class
2. View uploaded content with either 🔗 (external link) or 💾 (storage file) icon
3. Click "Open" button to download/view the file

## Technical Details

### Configuration
- **Bucket Name**: `content-files`
- **Max File Size**: 50MB
- **Cache Control**: 3600 seconds (1 hour)
- **File Naming**: `{timestamp}-{originalFileName}` (prevents duplicates)

### New Database Fields
- `isStorageFile`: Boolean indicating if file is from storage
- `fileName`: Original filename for display
- `storagePath`: Internal storage path for deletion

### Functions Added to main.js
- `uploadFileToStorage(file)`: Handles file upload to Supabase Storage
- Updated `saveContent()`: Supports both links and file uploads
- Updated `deleteContent(id)`: Deletes both database record and storage file
- Updated `loadContent()`: Displays file origin (storage or external)

## Troubleshooting

### Upload Fails with "Bucket not found"
→ Make sure you created the `content-files` bucket with PUBLIC access in Supabase Storage

### Files Not Accessible After Upload
→ Check RLS policies on the bucket allow public read access

### File Size Error
→ Ensure your file is under 50MB. Increase `MAX_FILE_SIZE` in config.js if needed

### Storage Credentials Missing
→ All storage operations use the same SUPABASE_ANON_KEY from config.js (no additional keys needed)

## Security Notes

⚠️ **For Production**:
1. Implement admin authentication for file uploads
2. Use Row-Level Security (RLS) policies to restrict uploads to admin users
3. Add virus scanning for uploaded files
4. Consider file type validation on backend
5. Use signed URLs for private file access if needed

## Future Enhancements

- Drag-and-drop file upload
- Multiple file uploads
- File preview before upload
- Storage usage analytics
- Automatic file compression for images
