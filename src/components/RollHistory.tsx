interface DiceRoll {
  diceType: string;
  results: number[];
}

interface RollResult {
  id: string;
  diceExpression: string;
  individualResults: DiceRoll[];
  modifier: number;
  total: number;
  timestamp: string;
}

interface RollHistoryProps {
  history: RollResult[];
}

export default function RollHistory({ history }: RollHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-2xl bg-dnd-dark/60 backdrop-blur-sm rounded-lg border-2 border-dnd-wood p-6">
        <h2 className="text-xl font-semibold text-dnd-gold text-center mb-4 fantasy-text-shadow">
          Roll History
        </h2>
        <p className="text-dnd-parchment/70 text-center italic">
          No rolls yet. Cast your first die to begin your adventure!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-dnd-dark/60 backdrop-blur-sm rounded-lg border-2 border-dnd-wood p-6">
      <h2 className="text-xl font-semibold text-dnd-gold text-center mb-4 fantasy-text-shadow">
        Roll History
      </h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {history.map((roll) => (
          <div 
            key={roll.id}
            className="p-3 bg-dnd-wood/20 rounded border border-dnd-copper/30 magical-transition hover:bg-dnd-wood/30"
          >
            <div className="flex justify-between items-center">
              <span className="text-dnd-gold font-semibold">
                {roll.diceExpression}
              </span>
              <span className="text-dnd-parchment/70 text-sm">
                {roll.timestamp}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-dnd-parchment">
                {roll.total}
              </span>
            </div>
            <div className="mt-1 text-sm text-dnd-parchment/80">
              {roll.individualResults.map((dice, i) => (
                <span key={i} className="mr-3">
                  {dice.diceType}: {dice.results.join(', ')}
                </span>
              ))}
              {roll.modifier !== 0 && (
                <span className="mr-3">
                  Modifier: {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}