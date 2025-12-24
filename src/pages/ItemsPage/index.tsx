import { useParams } from 'react-router-dom';

function ItemsPage() {
  const { gameId } = useParams();

  return (
    <div>
      <h1>Предмети гри {gameId}</h1>
      {/* Тут буде список предметів */}
    </div>
  );
}

export default ItemsPage;
