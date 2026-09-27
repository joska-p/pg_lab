import { Checkbox } from '../ui/components/Checkbox';
import { Stack } from '../ui/components/Stack';
import { colorVariants, elevationVariants, surfaceVariants } from './variants';

export function CheckboxMatrix() {
    return (
        <Stack direction="horizontal" gap="12">
            {colorVariants.map((color, index) => (
                <Stack key={index} direction="horizontal" gap="12">
                    {elevationVariants.map((elevation) => (
                        <Stack key={elevation} direction="vertical" gap="4">
                            {surfaceVariants.map((variant) => (
                                <Checkbox
                                    key={variant.label}
                                    label={`${elevation} ${variant.label} ${color}`}
                                    color={color}
                                    bg={variant.bg}
                                    tintBackground={variant.tintBackground}
                                    tintBorder={variant.tintBorder}
                                    tintShadow={variant.tintShadow}
                                    elevation={elevation}
                                    defaultChecked
                                />
                            ))}
                        </Stack>
                    ))}
                </Stack>
            ))}
        </Stack>
    );
}
