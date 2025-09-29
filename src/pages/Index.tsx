import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ThreeDDice from '@/components/ThreeDDice';
import DiceSelector, { DiceType } from '@/components/DiceSelector';
import RollHistory from '@/components/RollHistory';
import { Input } from '@/components/ui/input';
import { Plus, Minus, X, Trash } from 'lucide-react';

interface DiceRoll {
  diceType: string;
  count: number;
}

interface RollResult {
  id: string;
  diceExpression: string; // e.g., "2d20 + 1d6 + 3"
  individualResults: { diceType: string, results: number[] }[];
  modifier: number;
  total: number;
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
  const [selectedDice, setSelectedDice] = useState<DiceRoll[]>([{ diceType: 'd20', count: 1 }]);
  const [modifier, setModifier] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentResults, setCurrentResults] = useState<{ diceType: string, results: number[] }[] | null>(null);
  const [currentTotal, setCurrentTotal] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);
  const [activeDice, setActiveDice] = useState<string>('d20'); // For 3D visualization

  const getRandomResult = (diceType: string): number => {
    const dice = diceTypes.find(d => d.id === diceType);
    if (!dice) return 1;
    
    if (diceType === 'd100') {
      return Math.floor(Math.random() * 10) * 10; // 00, 10, 20, ... 90
    }
    
    return Math.floor(Math.random() * dice.sides) + 1;
  };

  const generateDiceExpression = () => {
    let expression = '';
    
    selectedDice.forEach((dice, index) => {
      if (index > 0) expression += ' + ';
      expression += `${dice.count}${dice.diceType}`;
    });
    
    if (modifier > 0) {
      expression += ` + ${modifier}`;
    } else if (modifier < 0) {
      expression += ` - ${Math.abs(modifier)}`;
    }
    
    return expression;
  };

  const rollDice = useCallback(() => {
    if (isRolling || selectedDice.length === 0) return;

    setIsRolling(true);
    setCurrentResults(null);
    setCurrentTotal(null);

    // For 3D visualization, use the first dice type
    setActiveDice(selectedDice[0].diceType);

    // Simulate dice rolling animation duration
    setTimeout(() => {
      // Roll all selected dice
      const allResults = selectedDice.map(dice => {
        const diceResults: number[] = [];
        for (let i = 0; i < dice.count; i++) {
          diceResults.push(getRandomResult(dice.diceType));
        }
        return { diceType: dice.diceType, results: diceResults };
      });

      // Calculate total
      const total = allResults.reduce((sum, diceResult) => {
        return sum + diceResult.results.reduce((diceSum, result) => diceSum + result, 0);
      }, modifier);

      setCurrentResults(allResults);
      setCurrentTotal(total);
      
      // Add to history
      const newRoll: RollResult = {
        id: Date.now().toString(),
        diceExpression: generateDiceExpression(),
        individualResults: allResults,
        modifier: modifier,
        total: total,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setRollHistory(prev => [newRoll, ...prev.slice(0, 9)]); // Keep last 10 rolls
      setIsRolling(false);
      
      // Show toast notification
      toast({
        title: "Dice Rolled!",
        description: `Result: ${total}`,
      });
    }, 3500);
  }, [selectedDice, modifier, isRolling]);

  const handleDiceSelect = (diceId: string) => {
    if (!isRolling) {
      // Add this dice type or increment its count
      const existingDiceIndex = selectedDice.findIndex(d => d.diceType === diceId);
      
      if (existingDiceIndex >= 0) {
        // Increment count of existing dice
        const newDice = [...selectedDice];
        newDice[existingDiceIndex] = {
          ...newDice[existingDiceIndex],
          count: newDice[existingDiceIndex].count + 1
        };
        setSelectedDice(newDice);
      } else {
        // Add new dice type
        setSelectedDice([...selectedDice, { diceType: diceId, count: 1 }]);
      }
    }
  };

  const handleModifierChange = (value: number) => {
    if (!isRolling) {
      setModifier(value);
    }
  };

  const handleRemoveDice = (index: number) => {
    if (!isRolling) {
      const newDice = [...selectedDice];
      newDice.splice(index, 1);
      setSelectedDice(newDice);
    }
  };

  const handleDiceCountChange = (index: number, newCount: number) => {
    if (!isRolling) {
      const newDice = [...selectedDice];
      if (newCount > 0) {
        newDice[index] = { ...newDice[index], count: newCount };
        setSelectedDice(newDice);
      } else {
        handleRemoveDice(index);
      }
    }
  };

  const clearDiceSelection = () => {
    if (!isRolling) {
      setSelectedDice([{ diceType: 'd20', count: 1 }]);
      setModifier(0);
      setCurrentResults(null);
      setCurrentTotal(null);
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
        <div className="w-full">
          <div className="flex flex-col space-y-4">
            {/* Selected dice display */}
            <div className="bg-dnd-dark/60 backdrop-blur-sm rounded-lg border-2 border-dnd-wood p-4">
              <h3 className="text-lg font-semibold text-dnd-gold mb-3">Selected Dice</h3>
              
              {selectedDice.length === 0 ? (
                <p className="text-dnd-parchment/70 italic">Select dice to roll</p>
              ) : (
                <div className="space-y-2">
                  {selectedDice.map((dice, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-dnd-wood/20 rounded">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDiceCountChange(index, dice.count - 1)}
                        disabled={isRolling}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="font-bold text-dnd-parchment">
                        {dice.count}{dice.diceType}
                      </span>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDiceCountChange(index, dice.count + 1)}
                        disabled={isRolling}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveDice(index)}
                        disabled={isRolling}
                        className="ml-auto h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Modifier section */}
                  <div className="flex items-center space-x-3 p-2 bg-dnd-wood/20 rounded mt-2">
                    <span className="text-dnd-parchment font-medium">Modifier:</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleModifierChange(modifier - 1)}
                      disabled={isRolling}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="font-bold text-dnd-gold w-8 text-center">
                      {modifier > 0 ? `+${modifier}` : modifier}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleModifierChange(modifier + 1)}
                      disabled={isRolling}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Expression preview */}
                  <div className="mt-3 text-center">
                    <p className="text-dnd-parchment font-medium">Roll Expression:</p>
                    <p className="text-dnd-gold text-lg font-bold">{generateDiceExpression()}</p>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="outline"
                      onClick={clearDiceSelection}
                      disabled={isRolling}
                      className="text-dnd-copper flex items-center"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DiceSelector
            diceTypes={diceTypes}
            onDiceSelect={handleDiceSelect}
            disabled={isRolling}
          />
        </div>

        {/* 3D Dice Display */}
        <div className="w-full max-w-lg">
          <ThreeDDice
            diceType={activeDice}
            isRolling={isRolling}
            result={currentResults ? currentResults[0]?.results[0] || null : null}
          />
        </div>

        {/* Result Display */}
        <div className="text-center space-y-4">
          {currentTotal !== null && !isRolling && (
            <div className="bg-gradient-to-r from-dnd-gold/20 to-dnd-copper/20 p-6 rounded-lg border-2 border-dnd-gold backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-dnd-gold mb-2">Result</h2>
              <div className="text-5xl font-bold text-dnd-parchment fantasy-text-shadow mb-4">
                {currentTotal}
              </div>
              
              {/* Show individual dice results */}
              {currentResults && currentResults.length > 0 && (
                <div className="mt-4 text-left">
                  <h3 className="text-xl text-dnd-gold mb-1">Breakdown:</h3>
                  <div className="space-y-1 text-dnd-parchment">
                    {currentResults.map((diceResult, index) => (
                      <div key={index} className="flex flex-wrap items-center">
                        <span className="font-bold mr-2">{diceResult.diceType}:</span>
                        <span>
                          {diceResult.results.join(', ')}
                        </span>
                      </div>
                    ))}
                    {modifier !== 0 && (
                      <div className="flex items-center">
                        <span className="font-bold mr-2">Modifier:</span>
                        <span>{modifier > 0 ? `+${modifier}` : modifier}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentTotal === null && !isRolling && (
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
          disabled={isRolling || selectedDice.length === 0}
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