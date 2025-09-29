import { Button } from '@/components/ui/button';

export interface DiceType {
  id: string;
  name: string;
  icon: string;
  sides: number;
}

interface DiceSelectorProps {
  diceTypes: DiceType[];
  onDiceSelect: (diceId: string) => void;
  disabled: boolean;
}

export default function DiceSelector({ 
  diceTypes, 
  onDiceSelect,
  disabled 
}: DiceSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-dnd-gold font-semibold mb-2">Choose Dice to Add</h3>
      <div className="flex flex-wrap gap-2">
        {diceTypes.map((dice) => (
          <Button
            key={dice.id}
            onClick={() => onDiceSelect(dice.id)}
            disabled={disabled}
            className={`
              bg-dnd-wood/60 hover:bg-dnd-wood 
              text-dnd-parchment border border-dnd-gold/40
              hover:border-dnd-gold transition duration-300
              h-14 w-14 rounded-full text-lg font-bold
            `}
            variant="ghost"
          >
            <span className="fantasy-text-shadow">{dice.icon}</span>
          </Button>
        ))}
      </div>
      <p className="mt-2 text-sm text-dnd-parchment/60">
        Click to add dice to your selection. You can add multiple of the same dice.
      </p>
    </div>
  );
}