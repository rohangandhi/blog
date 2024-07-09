let currentSection = 'home';

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'home') {
        document.getElementById('post-list').classList.remove('hidden');
        document.getElementById('post-content').classList.add('hidden');
    } else if (sectionId === 'about') {
        document.getElementById('post-list').classList.add('hidden');
        document.getElementById('post-content').classList.add('hidden');
    }
    currentSection = sectionId;
    updateProgressBar();

    if (sectionId === 'about') {
        loadAbout();
    }
}

async function loadPost(postUrl) {
    try {
        const response = await fetch(postUrl);
        if (!response.ok) {
            throw new Error('Post not found');
        }
        const markdownContent = await response.text();
        const htmlContent = marked.parse(markdownContent);
        document.getElementById('post-list').classList.add('hidden');
        const postContentElement = document.getElementById('post-content');
        postContentElement.innerHTML = htmlContent;
        postContentElement.classList.remove('hidden');
        document.getElementById('about').classList.add('hidden');
        updateProgressBar();
    } catch (error) {
        console.error('Error loading post:', error);
        show404();
    }
}

async function loadAbout() {
    try {
        const response = await fetch('about.html');
        const aboutContent = await response.text();
        document.getElementById('about').innerHTML = aboutContent;
    } catch (error) {
        console.error('Error loading about page:', error);
        show404();
    }
}

function show404() {
    document.getElementById('post-list').classList.add('hidden');
    document.getElementById('about').classList.add('hidden');
    const postContentElement = document.getElementById('post-content');
    postContentElement.innerHTML = `
        <div class="error-container">
            <div class="error-code">404</div>
            <div class="error-message">Oops! Page not found.</div>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <a href="index.html">Go back to homepage</a>
        </div>
    `;
    postContentElement.classList.remove('hidden');
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const article = document.querySelector('.post:not(.hidden)');
    if (currentSection === 'home' && article) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
        progressBar.style.display = 'block';
    } else {
        progressBar.style.display = 'none';
    }
}

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    if (postId) {
        loadPost(`posts/${postId}.md`);
    } else if (window.location.hash === '#about') {
        showSection('about');
    } else if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        show404();
    } else {
        showSection('home');
    }
}

function handleNavClick(event) {
    const href = event.target.getAttribute('href');
    if (href === '#about') {
        event.preventDefault();
        history.pushState(null, '', '#about');
        showSection('about');
    } else if (href === 'index.html' || href === '/' || href === '') {
        event.preventDefault();
        history.pushState(null, '', window.location.pathname);
        showSection('home');
    }
}

// Handle browser back/forward navigation
window.onpopstate = handleUrlParams;

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    handleUrlParams();
    
    // Add click event listeners to nav links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
});