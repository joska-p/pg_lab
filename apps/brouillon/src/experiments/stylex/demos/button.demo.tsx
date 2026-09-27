import { Button } from '../ui/components/Button';
import { Stack } from '../ui/components/Stack';
import { colorVariants, elevationVariants, surfaceVariants } from './variants';

export function ButtonMatrix() {
    return (
        <Stack direction="horizontal" gap="12">
            {colorVariants.map((color, index) => (
                <Stack key={index} direction="horizontal" gap="12">
                    {elevationVariants.map((elevation) => (
                        <Stack key={elevation} direction="vertical" gap="4">
                            {surfaceVariants.map((variant) => (
                                <Button
                                    key={variant.label}
                                    color={color}
                                    bg={variant.bg}
                                    tintBackground={variant.tintBackground}
                                    tintBorder={variant.tintBorder}
                                    tintShadow={variant.tintShadow}
                                    elevation={elevation}
                                >
                                    {elevation} {variant.label} {color}
                                </Button>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            ))}
        </Stack>
    );
}
