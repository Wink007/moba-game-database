import { useParams } from 'react-router-dom';

function ItemDetailPage() {
  const { gameId, itemId } = useParams();

  return (
    <div>
      <h1>Предмет #{itemId}</h1>
      <p>Гра: {gameId}</p>
      {/* Тут буде детальна інформація про предмет */}
    </div>
  );
}

export default ItemDetailPage;
