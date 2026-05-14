// ---------- Data ----------
let items = [];

// ---------- DOM references ----------
const search1 = document.getElementById('search1');
const search2 = document.getElementById('search2');
const dropdown1 = document.getElementById('dropdown1');
const dropdown2 = document.getElementById('dropdown2');
const showBtn = document.getElementById('showBtn');
const statusEl = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const resultContent = document.getElementById('resultContent');

let selected1 = null;
let selected2 = null;

// ---------- Fetch JSON ----------
async function loadData() {
    try {
        const resp = await fetch('floors_en.json');
        if (!resp.ok) throw new Error('File not found');
        items = await resp.json();
        items = items.filter(item => item.name && item.name.trim());
    } catch (e) {
        console.warn('Could not load data.json, using fallback data.');
        items = fallbackItems;
    }
    // Build searchable text: name + description + keywords
    items.forEach(item => {
        const kw = item.keywords ? item.keywords.toLowerCase() : '';
        const desc = item.description ? item.description.toLowerCase() : '';
        item._search = `${item.name.toLowerCase()} ${desc} ${kw}`;
    });
}

// ---------- Filter & render dropdown with images ----------
function filterItems(query) {
    if (!query) return items;
    const q = query.toLowerCase().trim();
    // Split query into words — match if ALL words appear in _search
    const words = q.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return items;
    
    return items.filter(item => {
        return words.every(word => item._search.includes(word));
    }).slice(0, 15);
}

function renderDropdown(input, dropdown, onSelect) {
    const query = input.value;
    const filtered = filterItems(query);
    dropdown.innerHTML = '';
    if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    filtered.forEach(item => {
        const div = document.createElement('div');
        
        // Text content: name + description + keywords hint
        const textSpan = document.createElement('span');
        textSpan.textContent = item.name;
        if (item.description) {
            const small = document.createElement('small');
            small.textContent = `　${item.description}`;
            small.style.color = '#777';
            textSpan.appendChild(small);
        }
        // Show matching keywords if query exists
        if (item.keywords && query.trim()) {
            const kwSmall = document.createElement('small');
            kwSmall.style.color = '#999';
            kwSmall.style.fontStyle = 'italic';
            textSpan.appendChild(kwSmall);
        }
        div.appendChild(textSpan);
        
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = item.name;
            dropdown.style.display = 'none';
            onSelect(item);
        });
        dropdown.appendChild(div);
    });
    dropdown.style.display = 'block';
}

// ---------- Setup search boxes ----------
function setupSearch(inputId, dropdownId, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    input.addEventListener('input', () => {
        renderDropdown(input, dropdown, onSelect);
    });

    input.addEventListener('focus', () => {
        renderDropdown(input, dropdown, onSelect);
    });

    input.addEventListener('blur', () => {
        setTimeout(() => { dropdown.style.display = 'none'; }, 150);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdown.style.display = 'none';
    });
}

// ---------- Selection handlers ----------
setupSearch('search1', 'dropdown1', (item) => {
    selected1 = item;
    updateStatus();
});

setupSearch('search2', 'dropdown2', (item) => {
    selected2 = item;
    updateStatus();
});

// ---------- Show results with images after text ----------
showBtn.addEventListener('click', () => {
    if (!selected1 || !selected2) {
        statusEl.textContent = 'Choose two items';
        resultsDiv.style.display = 'none';
        return;
    }
    if (selected1.id === selected2.id) {
        statusEl.textContent = 'Choose two different items';
        resultsDiv.style.display = 'none';
        return;
    }

    resultContent.innerHTML = `
        <div class="result-item">
            <div>
                <h3>${selected1.name}</h3>
                <p>${selected1.description || 'No description available.'}</p>
                ${selected1.image 
                    ? `<img src="${selected1.image}" alt="${selected1.name}" onerror="this.onerror=null; this.src=''; this.alt='Image not found'; this.classList.add('image-error');">` 
                    : '<div class="result-placeholder">📷</div>'}
            </div>
        </div>
        <div class="result-item">
            <div>
                <h3>${selected2.name}</h3>
                <p>${selected2.description || 'No description available.'}</p>
                ${selected2.image 
                    ? `<img src="${selected2.image}" alt="${selected2.name}" onerror="this.onerror=null; this.src=''; this.alt='Image not found'; this.classList.add('image-error');">` 
                    : '<div class="result-placeholder">📷</div>'}
                <img src="images/legend_en.png">                    
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
    statusEl.textContent = ``;
});

// ---------- Init ----------
loadData().then(() => {
    statusEl.textContent = '';
});