import { useParams } from 'react-router-dom';

function EmblemsPage() {
  const { gameId } = useParams();

  return (
    <div>
      <h1>Емблеми гри {gameId}</h1>
      {/* Тут буде список емблем */}
    </div>
  );
}

export default EmblemsPage;
