import {useState} from 'react';

const minimum = 1;
const maximum = 99;

export function QuantityStepper({initial = minimum, label = 'Quantity', disabled = false}: {
  initial?: number;
  label?: string;
  disabled?: boolean;
}) {
  const [quantity, setQuantity] = useState(initial);
  const cannotDecrease = disabled || quantity <= minimum;
  const cannotIncrease = disabled || quantity >= maximum;
  const control = 'grid size-11 place-items-center text-xl leading-none text-wine hover:bg-blush/40 aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent';

  return (
    <fieldset className="grid w-fit gap-1.5">
      <legend className="sr-only">{label}</legend>
      <span className="text-sm" aria-hidden="true">Quantity</span>
      <div className="inline-flex items-center divide-x divide-line border border-line bg-white">
        <button type="button" className={control} aria-label={'Decrease ' + label.toLowerCase()} aria-disabled={cannotDecrease}
          onClick={() => { if (!cannotDecrease) setQuantity(value => Math.max(minimum, value - 1)); }}>−</button>
        <output aria-label={label} className="grid h-11 min-w-11 place-items-center px-2 text-sm font-semibold tabular-nums">{quantity}</output>
        <button type="button" className={control} aria-label={'Increase ' + label.toLowerCase()} aria-disabled={cannotIncrease}
          onClick={() => { if (!cannotIncrease) setQuantity(value => Math.min(maximum, value + 1)); }}>+</button>
        <input type="hidden" name="quantity" value={quantity} />
      </div>
    </fieldset>
  );
}
