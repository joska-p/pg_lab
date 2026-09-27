import { Card } from '../components/Card';
import { Stack } from '../components/Stack';
import { ButtonMatrix } from './button.demo';
import { colorVariants, elevationVariants, staticVariants } from './vartiants';

export function CardMatrix() {
    return (
        <>
            {elevationVariants.map((elevation, index) => (
                <Stack key={index} direction="vertical" gap="8">
                    {colorVariants.map((color) => (
                        <Stack key={color} direction="vertical" gap="8">
                            {staticVariants.map((variant) => (
                                <Card
                                    key={variant.label}
                                    color={color}
                                    bg={variant.bg}
                                    tint={variant.tint}
                                    elevation={elevation}
                                >
                                    <h2>
                                        {elevation} {variant.label} {color}
                                    </h2>
                                    <ButtonMatrix />
                                </Card>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            ))}
        </>
    );
}
