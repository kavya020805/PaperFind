import React from 'react';
import { Link2, Sparkles } from 'lucide-react';

export default function ResultCard({ result, onFindRelated }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <a href={result.source_url} target="_blank" rel="noreferrer" className="result-title">
          {result.title}
        </a>
        {result.similarity_score && (
          <div className="score-badge">
            {(result.similarity_score * 100).toFixed(1)}% Match
          </div>
        )}
      </div>
      
      <div className="result-snippet">
        {result.snippet || (result.content && result.content.substring(0, 200) + '...')}
      </div>
      
      <div className="result-footer">
        <a href={result.source_url} target="_blank" rel="noreferrer" className="action-button">
          <Link2 size={16} /> View Source
        </a>
        
        {onFindRelated && (
          <button className="action-button" onClick={() => onFindRelated(result.id)}>
            <Sparkles size={16} /> Find Related
          </button>
        )}
      </div>
    </div>
  );
}
