import { useParams } from 'react-router-dom';

function SpellsPage() {
  const { gameId } = useParams();

  return (
    <div>
      <h1>Бойові заклинання гри {gameId}</h1>
      {/* Тут буде список заклинань */}
    </div>
  );
}

export default SpellsPage;
