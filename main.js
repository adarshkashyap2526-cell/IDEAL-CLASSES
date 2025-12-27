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
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
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

async function saveContent() {
    const type = document.getElementById('adm-type').value;
    const title = document.getElementById('adm-title').value;
    const link = document.getElementById('adm-link').value;
    const board = document.getElementById('adm-board').value;
    const cls = document.getElementById('adm-class').value;
    
    if (!title || !link) {
        alert('Please fill all required fields');
        return;
    }

    const content = {
        type,
        title,
        link,
        board,
        class: cls,
        timestamp: new Date().toISOString()
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
            div.innerHTML = `
                <h4>${item.title}</h4>
                ${item.time ? `<p>⏱ ${item.time} mins | 📊 ${item.marks} marks</p>` : ''}
                <a href="${item.link}" target="_blank" class="btn-open">Open ${item.type === 'quiz' ? 'Test' : item.type === 'note' ? 'PDF' : 'Course'}</a>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function filterType(type, element) {
    currentFilter = type;
    
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
    
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
