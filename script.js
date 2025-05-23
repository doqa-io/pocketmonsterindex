const API_URL = 'https://pokeapi.co/api/v2/pokemon';
let nextUrl = `${API_URL}?limit=20`;
let isLoading = false; // Track loading state

async function fetchPokemon(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    nextUrl = data.next;
    return data.results.map((p) => {
      const id = p.url.split('/').filter(Boolean).pop();
      return {
        id,
        name: p.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    });
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return [];
  }
}

async function loadMorePokemon() {
  if (!nextUrl || isLoading) return; // Prevent multiple calls
  isLoading = true;
  toggleLoading(true);
  const newPokemon = await fetchPokemon(nextUrl);
  renderList(newPokemon, true);
  toggleLoading(false);
  isLoading = false;
}

function renderList(list, append = false) {
  const grid = document.getElementById('pokemon-grid'); // Ensure grid is selected
  if (!append) grid.innerHTML = ''; // Clear grid if not appending
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="id">#${p.id}</span>
      <img src="${p.image}" alt="${p.name}">
      <h2>${p.name}</h2>
    `;
    grid.appendChild(card);
  });
}

function toggleLoading(show) {
  const loading = document.getElementById('loading');
  loading.classList.toggle('active', show);
}

const searchInput = document.getElementById('search');
const suggestionBox = document.getElementById('suggestion-box');
const clearBtn = document.getElementById('clear-btn');

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim().toLowerCase();
  if (query.length === 0) {
    suggestionBox.innerHTML = '';
    suggestionBox.classList.remove('visible');
    clearBtn.classList.remove('active');
    return;
  }

  clearBtn.classList.add('active');
  const response = await fetch(`${API_URL}?limit=1000`); // Fetch all Pokémon for search
  const data = await response.json();
  const filtered = data.results.filter(p => p.name.includes(query));

  suggestionBox.innerHTML = filtered.map(p => `<div class="suggestion-item" data-name="${p.name}">${p.name}</div>`).join('');
  suggestionBox.classList.add('visible');

  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInput.value = item.dataset.name;
      suggestionBox.innerHTML = '';
      suggestionBox.classList.remove('visible');
      fetchPokemonDetails(item.dataset.name);
    });
  });
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  suggestionBox.innerHTML = '';
  suggestionBox.classList.remove('visible');
  clearBtn.classList.remove('active');
});

async function fetchPokemonDetails(name) {
  try {
    const response = await fetch(`${API_URL}/${name}`);
    const data = await response.json();
    renderList([{
      id: data.id,
      name: data.name,
      image: data.sprites.front_default,
    }]);
  } catch (error) {
    console.error('Error fetching Pokémon details:', error);
  }
}

const loadMoreBtn = document.getElementById('load-more-btn');
loadMoreBtn.addEventListener('click', loadMorePokemon);

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadMorePokemon();
  }
});

async function populateFilters() {
  try {
    // Fetch Pokémon types
    const typeResponse = await fetch('https://pokeapi.co/api/v2/type');
    const typeData = await typeResponse.json();
    const typeFilter = document.getElementById('type-filter');
    typeData.results.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      typeFilter.appendChild(option);
    });

    // Fetch Pokémon generations
    const generationResponse = await fetch('https://pokeapi.co/api/v2/generation');
    const generationData = await generationResponse.json();
    const generationFilter = document.getElementById('generation-filter');
    generationData.results.forEach(gen => {
      const option = document.createElement('option');
      option.value = gen.name;
      option.textContent = gen.name;
      generationFilter.appendChild(option);
    });

    // Fetch Pokémon regions
    const regionResponse = await fetch('https://pokeapi.co/api/v2/region');
    const regionData = await regionResponse.json();
    const regionFilter = document.getElementById('region-filter');
    regionData.results.forEach(region => {
      const option = document.createElement('option');
      option.value = region.name;
      option.textContent = region.name;
      regionFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating filters:', error);
  }
}

function applyFilters() {
  const typeFilter = document.getElementById('type-filter').value;
  const generationFilter = document.getElementById('generation-filter').value;
  const regionFilter = document.getElementById('region-filter').value;

  // Fetch and filter Pokémon based on selected filters
  fetchPokemon(nextUrl).then(pokemonList => {
    const filteredList = pokemonList.filter(pokemon => {
      // Apply type, generation, and region filters here
      // Placeholder logic: Adjust based on actual API data structure
      return (!typeFilter || pokemon.type === typeFilter) &&
             (!generationFilter || pokemon.generation === generationFilter) &&
             (!regionFilter || pokemon.region === regionFilter);
    });
    renderList(filteredList);
  });
}

// Event listeners for filters
const typeFilter = document.getElementById('type-filter');
const generationFilter = document.getElementById('generation-filter');
const regionFilter = document.getElementById('region-filter');

typeFilter.addEventListener('change', applyFilters);
generationFilter.addEventListener('change', applyFilters);
regionFilter.addEventListener('change', applyFilters);

// Populate filters on page load
populateFilters();

toggleLoading(true);
loadMorePokemon();