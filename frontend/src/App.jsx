import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchContext, setSearchContext] = useState(''); 
  const [trending, setTrending] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/trending`)
      .then(res => setTrending(res.data))
      .catch(err => console.error("Failed to fetch trending:", err));
  }, []);

  const handleSearch = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(res.data.results);
      setSearchContext(`Results for "${searchTerm}"`);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search results. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const handleFindRelated = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/documents/${id}/related`);
      setResults(res.data);
      setSearchContext(`Papers related to document #${id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch related papers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">PaperFind</h1>
        <p className="subtitle">AI-Powered Semantic Search for Research</p>
      </header>

      <SearchBar query={query} setQuery={setQuery} onSearch={() => handleSearch(query)} />
      
      {trending.length > 0 && (
        <div className="trending-container">
          <span className="trending-label">Trending:</span>
          {trending.map((term, i) => (
            <button key={i} className="trending-pill" onClick={() => handleTrendingClick(term)}>
              {term}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="center-content">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && (
        <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="results-header">
            <span>{searchContext}</span>
            <span>{results.length} results found</span>
          </div>
          <div className="results-grid">
            {results.map((result) => (
              <ResultCard 
                key={result.id} 
                result={result} 
                onFindRelated={handleFindRelated} 
              />
            ))}
          </div>
        </>
      )}
      
      {!loading && !error && results.length === 0 && searchContext && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No results found. Try a different query.
        </div>
      )}
    </div>
  );
}

export default App;
