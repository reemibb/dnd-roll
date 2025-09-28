import { Button } from "@/components/ui/button";

export interface DiceType {
  id: string;
  name: string;
  icon: string;
  sides: number;
}

interface DiceSelectorProps {
  diceTypes: DiceType[];
  activeDice: string;
  onDiceSelect: (diceId: string) => void;
  disabled?: boolean;
}

export default function DiceSelector({ diceTypes, activeDice, onDiceSelect, disabled }: DiceSelectorProps) {
  return (
    <div className="w-full max-w-4xl">
      <div className="bg-gradient-to-r from-dnd-red/20 to-dnd-wood/20 p-6 rounded-lg border-2 border-dnd-wood backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-dnd-gold text-center mb-6 fantasy-text-shadow">
          Choose Your Dice
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
          {diceTypes.map((dice) => (
            <Button
              key={dice.id}
              variant={activeDice === dice.id ? "default" : "secondary"}
              onClick={() => onDiceSelect(dice.id)}
              disabled={disabled}
              className={`
                h-20 flex flex-col items-center justify-center gap-1 
                magical-transition group relative
                ${activeDice === dice.id 
                  ? 'bg-gradient-gold text-dnd-dark shadow-mystical border-dnd-gold' 
                  : 'bg-dnd-wood/30 text-dnd-parchment hover:bg-dnd-wood/50 border-dnd-copper'
                }
                hover:scale-105 hover:-translate-y-1
                border-2 rounded-lg
              `}
            >
              <span className="text-2xl">{dice.icon}</span>
              <span className="text-xs font-medium">{dice.name}</span>
              
              {/* Magical glow effect on hover */}
              <div className="absolute inset-0 rounded-lg bg-dnd-gold/20 opacity-0 group-hover:opacity-100 magical-transition pointer-events-none" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}