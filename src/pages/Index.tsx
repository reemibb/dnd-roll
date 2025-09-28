import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ThreeDDice from '@/components/ThreeDDice';
import DiceSelector, { DiceType } from '@/components/DiceSelector';
import RollHistory from '@/components/RollHistory';

interface RollResult {
  id: string;
  dice: string;
  result: number;
  timestamp: string;
}

const diceTypes: DiceType[] = [
  { id: 'd4', name: 'D4', icon: '4', sides: 4 },
  { id: 'd6', name: 'D6', icon: '6', sides: 6 },
  { id: 'd8', name: 'D8', icon: '8', sides: 8 },
  { id: 'd10', name: 'D10', icon: '10', sides: 10 },
  { id: 'd12', name: 'D12', icon: '12', sides: 12 },
  { id: 'd20', name: 'D20', icon: '20', sides: 20 },
  { id: 'd100', name: 'D%', icon: '%', sides: 100 },
];

const Index = () => {
  const [activeDice, setActiveDice] = useState<string>('d20');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);

  const getRandomResult = (diceType: string): number => {
    const dice = diceTypes.find(d => d.id === diceType);
    if (!dice) return 1;
    
    if (diceType === 'd100') {
      return Math.floor(Math.random() * 10) * 10; // 00, 10, 20, ... 90
    }
    
    return Math.floor(Math.random() * dice.sides) + 1;
  };

  const rollDice = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    setCurrentResult(null);

    // Simulate dice rolling animation duration
    setTimeout(() => {
      const result = getRandomResult(activeDice);
      setCurrentResult(result);
      
      // Add to history
      const newRoll: RollResult = {
        id: Date.now().toString(),
        dice: activeDice,
        result,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setRollHistory(prev => [newRoll, ...prev.slice(0, 9)]); // Keep last 10 rolls
      setIsRolling(false);
      
      // Show toast notification
      const diceType = diceTypes.find(d => d.id === activeDice);
      toast({
        title: "Dice Rolled!",
        description: `${diceType?.name}: ${activeDice === 'd100' && result === 0 ? '00' : result}`,
      });
    }, 2000);
  }, [activeDice, isRolling]);

  const handleDiceSelect = (diceId: string) => {
    if (!isRolling) {
      setActiveDice(diceId);
      setCurrentResult(null);
    }
  };

  // Handle keyboard rolling
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if ((event.code === 'Space' || event.code === 'Enter') && !isRolling) {
      event.preventDefault();
      rollDice();
    }
  }, [rollDice, isRolling]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => handleKeyPress(event);
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const currentDiceType = diceTypes.find(d => d.id === activeDice);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-8">
      {/* Header */}
      <header className="text-center max-w-4xl w-full">
        <h1 className="text-5xl md:text-6xl font-bold text-dnd-gold fantasy-text-shadow mb-4 tracking-wider">
          D&D DICE ROLLER
        </h1>
        <p className="text-xl text-dnd-parchment italic">
          May your rolls be ever in your favor!
        </p>
        <div className="w-full h-1 bg-gradient-gold mt-6 rounded-full" />
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center space-y-8 w-full max-w-6xl">
        {/* Dice Selector */}
        <DiceSelector
          diceTypes={diceTypes}
          activeDice={activeDice}
          onDiceSelect={handleDiceSelect}
          disabled={isRolling}
        />

        {/* 3D Dice Display */}
        <div className="w-full max-w-lg">
          <ThreeDDice
            diceType={activeDice}
            isRolling={isRolling}
            result={currentResult}
          />
        </div>

        {/* Result Display */}
        <div className="text-center space-y-4">
          {currentResult !== null && !isRolling && (
            <div className="bg-gradient-to-r from-dnd-gold/20 to-dnd-copper/20 p-6 rounded-lg border-2 border-dnd-gold backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-dnd-gold mb-2">Result</h2>
              <div className="text-5xl font-bold text-dnd-parchment fantasy-text-shadow">
                {currentDiceType?.name}: {activeDice === 'd100' && currentResult === 0 ? '00' : currentResult}
              </div>
            </div>
          )}
          
          {!currentResult && !isRolling && (
            <div className="text-xl text-dnd-parchment/70 italic">
              Choose your dice and roll to begin your adventure!
            </div>
          )}
          
          {isRolling && (
            <div className="text-xl text-dnd-gold animate-pulse">
              Rolling the dice...
            </div>
          )}
        </div>

        {/* Roll Button */}
        <Button
          onClick={rollDice}
          disabled={isRolling}
          size="lg"
          className={`
            text-2xl font-bold py-6 px-12 rounded-xl
            bg-gradient-fantasy hover:scale-105 magical-transition
            text-dnd-parchment border-2 border-dnd-gold
            shadow-deep hover:shadow-mystical
            disabled:opacity-50 disabled:hover:scale-100
            ${isRolling ? 'animate-pulse' : ''}
          `}
        >
          {isRolling ? 'ROLLING...' : 'ROLL DICE'}
        </Button>

        {/* Keyboard Hint */}
        <p className="text-sm text-dnd-parchment/60 text-center">
          Press <kbd className="bg-dnd-wood px-2 py-1 rounded text-dnd-parchment">Space</kbd> or{' '}
          <kbd className="bg-dnd-wood px-2 py-1 rounded text-dnd-parchment">Enter</kbd> to roll
        </p>

        {/* Roll History */}
        <RollHistory history={rollHistory} />
      </div>

      {/* Footer */}
      <footer className="text-center text-dnd-parchment/70 mt-16">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-dnd-gold to-transparent mb-4" />
        <p className="italic">
          "The dice will fall where they may, but fortune favors the bold!"
        </p>
      </footer>
    </div>
  );
};

export default Index;