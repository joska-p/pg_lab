import { useRegistryKey } from '../../../stores/appStore';
import { Card } from '../ui/components/Card';
import { Stack } from '../ui/components/Stack';
import { registry } from './registry';
import { colorVariants, elevationVariants, surfaceVariants } from './variants';

export function CardMatrix() {
    const registryKey = useRegistryKey();
    const Component = registry[registryKey];
    return (
        <>
            {elevationVariants.map((elevation, index) => (
                <Stack key={index} direction="vertical" gap="8">
                    {colorVariants.map((color) => (
                        <Stack key={color} direction="vertical" gap="8">
                            {surfaceVariants.map((variant) => (
                                <Card
                                    key={variant.label}
                                    color={color}
                                    bg={variant.bg}
                                    tintBackground={variant.tintBackground}
                                    tintBorder={variant.tintBorder}
                                    tintShadow={variant.tintShadow}
                                    elevation={elevation}
                                >
                                    <h2>
                                        {elevation} {variant.label} {color}
                                    </h2>
                                    <Component />
                                </Card>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            ))}
        </>
    );
}
