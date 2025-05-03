const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let allCountries = [];
let filteredCountries = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Fetch and initialize countries
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(initializeCountries)
        .catch(handleError);

    // Event listeners
    searchBtn.addEventListener('click', search);
    searchInput.addEventListener('keydown', e => e.key === 'Enter' && search());
});

function initializeCountries(data) {
    allCountries = data.map(country => ({
        name: country.name.common.toLowerCase(),
        displayName: country.name.common,
        capital: country.capital?.[0] || 'N/A',
        region: country.region,
        languages: Object.values(country.languages || {}).join(', ') || 'N/A',
        flag: country.flags.png
    }));
    search();
}

function search() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    filteredCountries = allCountries
        .filter(country => country.name.includes(searchTerm))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
    currentPage = 1;
    updateUI();
}

function updateUI() {
    renderCountries();
    renderPagination();
}

function renderCountries() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filteredCountries.slice(start, start + ITEMS_PER_PAGE);
    const container = document.getElementById('countryContainer');
    
    container.innerHTML = paginated.length > 0 
        ? paginated.map(renderCountryCard).join('')
        : '<p class="no-results">No countries found</p>';
}

function renderCountryCard(country) {
    return `
        <div class="country-card">
            <img src="${country.flag}" alt="${country.displayName} flag">
            <h2>${country.displayName}</h2>
            <p><strong>Capital:</strong> ${country.capital}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Languages:</strong> ${country.languages}</p>
        </div>
    `;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (totalPages === 0) return;

    const pages = calculatePageNumbers(totalPages);
    const fragment = document.createDocumentFragment();

    if (currentPage > 1) fragment.appendChild(createPageButton('<', currentPage - 1));

    // Page Numbers
    pages.forEach(page => {
        fragment.appendChild(
            page === '...' 
                ? createEllipsis()
                : createPageButton(page)
        );
    });

    if (currentPage < totalPages) fragment.appendChild(createPageButton('>', currentPage + 1));

    paginationDiv.appendChild(fragment);
}

function calculatePageNumbers(totalPages) {
    const pages = new Set([1, totalPages]);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i=start; i<=end; i++) pages.add(i);

    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    return sortedPages.reduce((acc, page, index, arr) => {
        if (index > 0 && page - arr[index - 1] > 1) acc.push('...');
        acc.push(page);
        return acc;
    }, []);
}

function createPageButton(content, targetPage=content) {
    const button = document.createElement('button');
    button.textContent = content;
    if (content === currentPage) button.classList.add('active');
    button.addEventListener('click', () => {
        currentPage = targetPage;
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

function handleError(error) {
    console.error('Error:', error);
    document.getElementById('countryContainer').innerHTML = 
        '<p class="no-results">Failed to load countries</p>';
}