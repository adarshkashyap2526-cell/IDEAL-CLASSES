// Global Variables
let currentBoard = '';
let currentClass = '';
let currentFilter = 'quiz';
let adminUser = null;

const CLASS_MAP = {
    'CBSE': ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    'Bihar Board': ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    'English': ['Beginner', 'Intermediate', 'Advanced'],
    'Competitive Exam': ['NEET', 'JEE', 'SSC', 'UPSC'],
    'Courses': ['Web Development', 'Data Science', 'Mobile App']
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    updateAdminClassList(); // Initialize class list with default board
    loadQuotes();
    checkAdminLogin();
});

// Admin Functions
function toggleAdmin() {
    const login = document.getElementById('admin-login');
    const panel = document.getElementById('admin-panel');
    
    if (adminUser) {
        logout();
    } else {
        login.classList.toggle('hidden');
    }
}

async function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pass').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        adminUser = { email };
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        toggleInputs(); // Initialize admin form inputs
        loadAdminContent();
    } else {
        alert('Invalid credentials');
    }
}

function checkAdminLogin() {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
        adminUser = JSON.parse(savedAdmin);
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        toggleInputs(); // Initialize admin form inputs
        loadAdminContent();
    }
}

function logout() {
    adminUser = null;
    localStorage.removeItem('adminUser');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-pass').value = '';
}

function toggleInputs() {
    const type = document.getElementById('adm-type').value;
    const quizInputs = document.getElementById('quiz-inputs');
    const metaInputs = document.getElementById('meta-inputs');
    
    if (type === 'quote') {
        quizInputs.style.display = 'none';
        metaInputs.style.display = 'none';
    } else {
        quizInputs.style.display = type === 'quiz' ? 'flex' : 'none';
        metaInputs.style.display = 'flex';
    }
}

function updateAdminClassList() {
    const board = document.getElementById('adm-board').value;
    const classSelect = document.getElementById('adm-class');
    const classes = CLASS_MAP[board] || [];
    
    classSelect.innerHTML = '';
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });
}

// File Upload to Supabase Storage
async function uploadFileToStorage(file) {
    if (!file) return null;
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        alert(`File size exceeds 50MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return null;
    }
    
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${STORAGE_BUCKET}/${fileName}`;
    
    try {
        const { data, error } = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // Get public URL
        const { data: publicUrl } = supabaseClient.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);
        
        return {
            fileName: file.name,
            storagePath: fileName,
            publicUrl: publicUrl.publicUrl
        };
    } catch (error) {
        console.error('File upload error:', error);
        alert('Error uploading file: ' + error.message);
        return null;
    }
}

async function saveContent() {
    const type = document.getElementById('adm-type').value;
    const title = document.getElementById('adm-title').value;
    const link = document.getElementById('adm-link').value;
    const fileInput = document.getElementById('adm-file');
    const file = fileInput ? fileInput.files[0] : null;
    const board = document.getElementById('adm-board').value;
    const cls = document.getElementById('adm-class').value;
    
    if (!title) {
        alert('Please fill title field');
        return;
    }
    
    // Check if either link or file is provided
    if (!link && !file) {
        alert('Please provide either a link or upload a file');
        return;
    }

    let finalLink = link;
    let fileMetadata = null;
    
    // Upload file if provided
    if (file) {
        const uploadResult = await uploadFileToStorage(file);
        if (!uploadResult) return; // Upload failed
        
        fileMetadata = uploadResult;
        finalLink = uploadResult.publicUrl; // Use storage URL
    }
    
    const content = {
        type,
        title,
        link: finalLink,
        board,
        class: cls,
        timestamp: new Date().toISOString(),
        isStorageFile: !!file,
        fileName: fileMetadata ? fileMetadata.fileName : null,
        storagePath: fileMetadata ? fileMetadata.storagePath : null
    };

    if (type === 'quiz') {
        content.time = document.getElementById('adm-time').value;
        content.marks = document.getElementById('adm-marks').value;
    }

    try {
        const { data, error } = await supabaseClient
            .from('content')
            .insert([content]);

        if (error) throw error;

        alert('Content uploaded successfully!');
        document.getElementById('adm-title').value = '';
        document.getElementById('adm-link').value = '';
        document.getElementById('adm-time').value = '';
        document.getElementById('adm-marks').value = '';
        if (fileInput) fileInput.value = '';
        loadAdminContent();
    } catch (error) {
        alert('Error uploading content: ' + error.message);
    }
}

async function loadAdminContent() {
    try {
        const { data, error } = await supabaseClient
            .from('content')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        const list = document.getElementById('admin-list');
        list.innerHTML = '';

        data.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'padding:10px; margin:5px 0; background:#f5f5f5; border-radius:5px; display:flex; justify-content:space-between; align-items:center;';
            div.innerHTML = `
                <span>${item.type.toUpperCase()} - ${item.title}</span>
                <button onclick="deleteContent('${item.id}')" style="background:none; border:none; color:red; cursor:pointer;">🗑</button>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

async function deleteContent(id) {
    if (confirm('Delete this content?')) {
        try {
            // Get content details to check if it's a storage file
            const { data: contentData, error: fetchError } = await supabaseClient
                .from('content')
                .select('storagePath')
                .eq('id', id)
                .single();
            
            if (!fetchError && contentData && contentData.storagePath) {
                // Delete file from storage
                await supabaseClient.storage
                    .from(STORAGE_BUCKET)
                    .remove([contentData.storagePath]);
            }
            
            // Delete content record
            const { error } = await supabaseClient
                .from('content')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadAdminContent();
        } catch (error) {
            alert('Error deleting content: ' + error.message);
        }
    }
}

// Student Navigation
function goHome() {
    document.getElementById('view-home').classList.remove('hidden');
    document.getElementById('view-selection').classList.add('hidden');
    document.getElementById('view-dashboard').classList.add('hidden');
}

function selectBoard(board) {
    currentBoard = board;
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-selection').classList.remove('hidden');
    document.getElementById('selection-title').textContent = `Select ${board} Class`;
    
    const grid = document.getElementById('selection-grid');
    grid.innerHTML = '';
    
    const classes = CLASS_MAP[board] || [];
    classes.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => selectClass(cls);
        card.innerHTML = `<h3>${cls}</h3>`;
        grid.appendChild(card);
    });
}

function selectClass(cls) {
    currentClass = cls;
    currentFilter = 'quiz';
    document.getElementById('view-selection').classList.add('hidden');
    document.getElementById('view-dashboard').classList.remove('hidden');
    document.getElementById('lbl-context').textContent = `${currentBoard} - ${currentClass}`;
    
    // Set first tab as active
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        if (index === 0) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    loadContent();
}

function backToSelection() {
    selectBoard(currentBoard);
}

async function loadContent() {
    try {
        const { data, error } = await supabaseClient
            .from('content')
            .select('*')
            .eq('board', currentBoard)
            .eq('class', currentClass)
            .eq('type', currentFilter)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        const list = document.getElementById('content-list');
        
        if (data.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:#999;">No content available</p>';
            return;
        }

        list.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'content-card';
            const fileIcon = item.isStorageFile ? '💾' : '🔗';
            const fileInfo = item.isStorageFile ? ` <small style="color:#999;"> (${item.fileName})</small>` : '';
            div.innerHTML = `
                <h4>${item.title}${fileInfo}</h4>
                ${item.time ? `<p>⏱ ${item.time} mins | 📊 ${item.marks} marks</p>` : ''}
                <a href="${item.link}" target="_blank" class="btn-open">${fileIcon} Open ${item.type === 'quiz' ? 'Test' : item.type === 'note' ? 'PDF' : 'Course'}</a>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function filterType(type, element) {
    currentFilter = type;
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    element.classList.add('active');
    
    // Load content with new filter
    loadContent();
}

async function loadQuotes() {
    try {
        const { data, error } = await supabaseClient
            .from('content')
            .select('*')
            .eq('type', 'quote');

        if (error) throw error;

        if (data.length > 0) {
            const randomQuote = data[Math.floor(Math.random() * data.length)];
            document.getElementById('quote-display').textContent = randomQuote.title;
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
        document.getElementById('quote-display').textContent = '✨ Welcome to Ideal Classes - Excellence in Education!';
    }
}
