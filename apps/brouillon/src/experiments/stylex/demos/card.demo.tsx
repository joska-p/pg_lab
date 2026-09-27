import { useRegistryKey } from '../../../stores/appStore';
import { Card } from '../ui/components/Card';
import { Stack } from '../ui/components/Stack';
import { registry } from './registry';
import { getSurfaceVariants } from './variants';

export function CardMatrix() {
    const registryKey = useRegistryKey();
    const Component = registry[registryKey];
    const surfaceVariants = getSurfaceVariants();

    return (
        <Stack direction="horizontal" gap="12">
            {surfaceVariants.map((variant) => (
                <Card
                    key={variant.label}
                    color={variant.color}
                    bg={variant.bg}
                    tintBackground={variant.tintBackground}
                    tintBorder={variant.tintBorder}
                    tintShadow={variant.tintShadow}
                    elevation={variant.elevation}
                >
                    <h2>{variant.label}</h2>
                    <Component />
                </Card>
            ))}
        </Stack>
    );
}
