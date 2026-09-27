import { Checkbox } from '../ui/components/Checkbox';
import { Stack } from '../ui/components/Stack';
import { getSurfaceVariants } from './variants';

export function CheckboxMatrix() {
    const surfaceVariants = getSurfaceVariants();

    return (
        <Stack direction="horizontal" gap="12">
            {surfaceVariants.map((variant) => (
                <Checkbox
                    key={variant.label}
                    label={variant.label}
                    color={variant.color}
                    bg={variant.bg}
                    tintBackground={variant.tintBackground}
                    tintBorder={variant.tintBorder}
                    tintShadow={variant.tintShadow}
                    elevation={variant.elevation}
                    defaultChecked
                />
            ))}
        </Stack>
    );
}
