import React from 'react';

function GameList({ games, onEdit, onDelete, onSelect, selectedId }) {
  if (games.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 Немає ігор у базі даних</p>
        <p>Натисніть "+ Додати гру" щоб створити першу</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Назва</th>
          <th>Жанр</th>
          <th>Опис</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game) => (
          <tr 
            key={game.id} 
            className={selectedId === game.id ? 'selected' : ''}
            onClick={() => onSelect(game)}
            style={{ cursor: 'pointer' }}
          >
            <td>{game.id}</td>
            <td><strong>{game.name}</strong></td>
            <td>{game.genre}</td>
            <td>{game.description?.substring(0, 80) || ''}{game.description?.length > 80 ? '...' : ''}</td>
            <td>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(game);
                  }}
                >
                  ✏️ Редагувати
                </button>
                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(game.id);
                  }}
                >
                  🗑️ Видалити
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GameList;
