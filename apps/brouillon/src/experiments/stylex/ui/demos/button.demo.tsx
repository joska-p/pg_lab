import { Button } from '../components/Button';
import { Stack } from '../components/Stack';
import { colorVariants, elevationVariants, staticVariants } from './vartiants';

export function ButtonMatrix() {
    return (
        <Stack direction="horizontal" gap="12">
            {colorVariants.map((color, index) => (
                <Stack key={index} direction="horizontal" gap="12">
                    {elevationVariants.map((elevation) => (
                        <Stack key={elevation} direction="vertical" gap="4">
                            {staticVariants.map((variant) => (
                                <Button
                                    key={variant.label}
                                    color={color}
                                    bg={variant.bg}
                                    tint={variant.tint}
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
