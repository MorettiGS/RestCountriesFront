const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let filteredCountries = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Event listeners
    const triggerSearch = () => fetchCountries(searchInput.value.trim());
    searchBtn.addEventListener('click', triggerSearch);
    searchInput.addEventListener('keydown', e => e.key === 'Enter' && triggerSearch());
    
    // Initial load
    fetchCountries();
});

async function fetchCountries(searchTerm = '') {
    try {
        const url = `https://restcountries.com/v3.1/${
            searchTerm ? `name/${encodeURIComponent(searchTerm)}` : 'all'
        }?fields=name,capital,region,languages,flags`;
        
        const response = await fetch(url);
        const data = response.ok ? await response.json() : [];
        
        filteredCountries = data
            .map(({ name, capital, region, languages, flags }) => ({
                name: name.common.toLowerCase(),
                displayName: name.common,
                capital: capital?.[0] || 'N/A',
                region: region,
                languages: Object.values(languages || {}).join(', ') || 'N/A',
                flag: flags.png
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        currentPage = 1;
        updateUI();
    } catch (error) {
        console.error('Error:', error);
        filteredCountries = [];
        updateUI();
    }
}

function updateUI() {
    renderCountries();
    renderPagination();
}

function renderCountries() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filteredCountries.slice(start, start + ITEMS_PER_PAGE);
    const container = document.getElementById('countryContainer');
    
    container.innerHTML = paginated.length > 0 ? `
        ${paginated.map(country => renderCountry(country))
            .join('')}` : '<p class="no-results">No countries found</p>';
}

function renderCountry(country) {
    return `
        <div class="country-card">
            <img src="${country.flag}" alt="${country.displayName} flag">
            <h2>${country.displayName}</h2>
            <p><strong>Capital:</strong> ${country.capital}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Languages:</strong> ${country.languages}</p>
        </div>
    `
}

function renderPagination() {
    const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (!totalPages) return;

    const pages = calculatePageNumbers(totalPages);
    const fragment = document.createDocumentFragment();

    if (currentPage > 1)
        fragment.appendChild(createPageButton('<', currentPage - 1, 'Previous page'));

    pages.forEach(page => fragment.appendChild(
        page === '...' ? createEllipsis() : createPageButton(page)
    ));

    if (currentPage < totalPages)
        fragment.appendChild(createPageButton('>', currentPage + 1, 'Next page'));

    paginationDiv.appendChild(fragment);
}

function calculatePageNumbers(totalPages) {
    const pages = new Set([1, totalPages]);
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    for (let i=rangeStart; i<=rangeEnd; i++) pages.add(i);
    
    return Array.from(pages).sort((a, b) => a - b)
        .reduce((acc, page, i, arr) => {
            if (i > 0 && page - arr[i-1] > 1) acc.push('...');
            acc.push(page);
            return acc;
        }, []);
}

function createPageButton(page, targetPage, alt) {
    const button = document.createElement('button');
    button.textContent = page;
    button.title = alt || page;
    if (page === currentPage) button.classList.add('active');
    button.addEventListener('click', () => {
        currentPage = targetPage || page;
        updateUI();
    });
    return button;
}

function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'ellipsis';
    ellipsis.textContent = '...';
    return ellipsis;
}