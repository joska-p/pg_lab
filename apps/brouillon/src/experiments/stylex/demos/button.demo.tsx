import { Button } from '../ui/components/Button';
import { Stack } from '../ui/components/Stack';
import { getSurfaceVariants } from './variants';

export function ButtonMatrix() {
    const surfaceVariants = getSurfaceVariants();

    return (
        <Stack direction="horizontal" gap="12">
            {surfaceVariants.map((variant) => (
                <Button
                    key={variant.label}
                    color={variant.color}
                    bg={variant.bg}
                    tintBackground={variant.tintBackground}
                    tintBorder={variant.tintBorder}
                    tintShadow={variant.tintShadow}
                    elevation={variant.elevation}
                >
                    {variant.label}
                </Button>
            ))}
        </Stack>
    );
}
