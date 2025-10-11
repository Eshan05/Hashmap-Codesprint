import { IoMale as MaleIcon, IoFemale as FemaleIcon } from "react-icons/io5";
import { IconType } from 'react-icons/lib';

export type GenderOption = 'male' | 'female';

interface GenderSelectorProps {
  value: GenderOption | null | undefined;
  onChange: (value: GenderOption) => void;
  disabled?: boolean;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange, disabled }) => {

  const renderOption = (
    optionValue: GenderOption,
    Icon: IconType,
    label: string,
    description: string
  ) => {
    const isSelected = value === optionValue;

    const baseClasses = 'p-4 rounded-lg border-2 transition-all duration-200 text-center cursor-pointer';
    const selectedClasses = 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400';
    const unselectedClasses = 'border-muted bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground';

    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(optionValue)}
        className={[
          baseClasses,
          disabled ? disabledClasses : (isSelected ? selectedClasses : unselectedClasses),
        ].join(' ')}
      >
        <Icon className="w-8 h-8 mx-auto mb-2" />
        <p className="font-semibold">{label}</p>
        <p className="text-xs opacity-75">{description}</p>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {renderOption('male', MaleIcon, 'Male', 'Identifies as male')}
      {renderOption('female', FemaleIcon, 'Female', 'Identifies as female')}
      {/* You can add more options here:
      {renderOption('other', UserIcon, 'Other', 'Non-binary/Other')}
      */}
    </div>
  );
};

export default GenderSelector;