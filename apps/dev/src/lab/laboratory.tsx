import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Badge,
  Button,
  Card,
  ControlField,
  Segmented,
  Slider,
  Stack,
  Surface,
  TextInput,
  families,
} from "@repo/ui";
import { colorVariants } from "@repo/ui/tokens/colorVariants.stylex";
import { typography } from "@repo/ui/consts/typography.stylex";
import { space } from "@repo/ui/consts/spacing.stylex";
import { Chip, Key, LabField, Led, MaterialScene } from "./experimental";

type ThemeMode = "light" | "dark" | "system";

const styles = stylex.create({
  root: {
    height: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: space["6"],
    padding: space["6"],
    boxSizing: "border-box",
    overflowY: "auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space["3"],
  },
  title: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
  },
  subtitle: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colorVariants.mutedFg,
  },
  themeControl: {
    marginLeft: "auto",
  },

  studyHead: {
    display: "flex",
    alignItems: "baseline",
    gap: space["3"],
    marginBottom: space["3"],
  },
  index: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colorVariants.mutedFg,
  },
  studyTitle: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
  },
  aim: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colorVariants.mutedFg,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: space["8"],
    alignItems: "start",
    "@media (max-width: 880px)": {
      gridTemplateColumns: "1fr",
    },
  },

  col: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    minWidth: 0,
  },
  caption: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
    color: colorVariants.mutedFg,
  },
  note: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colorVariants.mutedFg,
  },
});

type StudyProps = {
  index: string;
  name: string;
  accent: keyof typeof families;
  aim: string;
  children: React.ReactNode;
};

function Study({ index, name, accent, aim, children }: StudyProps) {
  return (
    <section>
      <div {...stylex.props(styles.studyHead)}>
        <Led color={families[accent].base} />
        <span {...stylex.props(styles.index)}>{index}</span>
        <h2 {...stylex.props(styles.studyTitle)}>{name}</h2>
        <span {...stylex.props(styles.aim)}>— {aim}</span>
      </div>
      {children}
    </section>
  );
}

function Pair({
  current,
  experimental,
}: {
  current: React.ReactNode;
  experimental: React.ReactNode;
}) {
  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.col)}>
        <span {...stylex.props(styles.caption)}>current · today</span>
        {current}
      </div>
      <div {...stylex.props(styles.col)}>
        <span {...stylex.props(styles.caption)}>experimental · probe</span>
        {experimental}
      </div>
    </div>
  );
}

type LaboratoryProps = {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  style?: StyleXStyles;
};

export function Laboratory({ theme, onThemeChange, style }: LaboratoryProps) {
  return (
    <div {...stylex.props(styles.root, style)}>
      <div {...stylex.props(styles.header)}>
        <Led color={families.amber.base} live />
        <h1 {...stylex.props(styles.title)}>visual laboratory</h1>
        <span {...stylex.props(styles.subtitle)}>
          current architecture vs experimental vocabulary · same tokens, app-local styles only
        </span>
        <div {...stylex.props(styles.themeControl)}>
          <Segmented<ThemeMode>
            options={["light", "dark", "system"]}
            value={theme}
            onValueChange={onThemeChange}
          />
        </div>
      </div>

      <Study index="01" name="action" accent="solder" aim="a capacity, not a fill">
        <Pair
          current={
            <Card variant="surface">
              <ControlField label="transport">
                <Stack direction="horizontal" gap="8" wrap>
                  <Button family="solder" live lead>
                    run
                  </Button>
                  <Button family="error">record</Button>
                  <Button family="aqua">plot</Button>
                </Stack>
              </ControlField>
            </Card>
          }
          experimental={
            <>
              <Stack direction="horizontal" gap="8" wrap>
                <Key label="run" family="green" live lead />
                <Key label="record" family="red" />
                <Key label="plot" family="aqua" />
                <Key label="save" />
              </Stack>
              <p {...stylex.props(styles.note)}>
                matte key all the way — the LED names the action, the face stays neutral
              </p>
            </>
          }
        />
      </Study>

      <Study
        index="02"
        name="field"
        accent="neon-violet"
        aim="a well answers with one contact ring"
      >
        <Pair
          current={
            <Card variant="surface">
              <Stack gap="6">
                <TextInput label="patch" defaultValue="bass-01" />
                <TextInput label="cutoff" family="neon-violet" defaultValue="62" />
              </Stack>
            </Card>
          }
          experimental={
            <>
              <Stack gap="6">
                <LabField label="patch name" family="green" live defaultValue="bass-01" />
                <LabField label="routing" defaultValue="bus-2" />
              </Stack>
              <p {...stylex.props(styles.note)}>
                one well, one ring — the data tag lives outside the box
              </p>
            </>
          }
        />
      </Study>

      <Study index="03" name="tag" accent="orange" aim="hue = meaning, not status">
        <Pair
          current={
            <Card variant="surface">
              <Stack direction="horizontal" gap="8" wrap>
                <Badge family="solder">run</Badge>
                <Badge family="aqua">plot</Badge>
                <Badge family="amber">hold</Badge>
                <Badge>neutral</Badge>
              </Stack>
            </Card>
          }
          experimental={
            <>
              <Stack direction="horizontal" gap="8" wrap>
                <Chip label="aqua" family="aqua" />
                <Chip label="orange" family="orange" />
                <Chip label="violet" family="violet" />
                <Chip label="live · 48k" family="green" live />
                <Chip label="neutral" />
              </Stack>
              <p {...stylex.props(styles.note)}>
                the badge as it stands — hue says what this thing is, the LED says it{"'"}s on
              </p>
            </>
          }
        />
      </Study>

      <Study index="04" name="parameter" accent="aqua" aim="the rail reads a parameter, not a role">
        <Pair
          current={
            <Card variant="surface">
              <Stack gap="6">
                <Slider
                  label="cutoff"
                  family="neon-violet"
                  min={40}
                  max={16000}
                  defaultValue={6200}
                />
                <Slider label="resonance" family="orange" min={0} max={100} defaultValue={62} />
              </Stack>
            </Card>
          }
          experimental={
            <>
              <Stack gap="6">
                <Slider
                  label="cutoff"
                  family="neon-violet"
                  min={40}
                  max={16000}
                  defaultValue={6200}
                />
                <Slider label="resonance" family="orange" min={0} max={100} defaultValue={62} />
                <Slider label="drive" family="amber" min={0} max={100} defaultValue={24} />
              </Stack>
              <p {...stylex.props(styles.note)}>
                anatomy untouched — only the fill{"'"}s meaning changed (house hue = no identity)
              </p>
            </>
          }
        />
      </Study>

      <Study index="05" name="material" accent="amber" aim="light under, glass above">
        <Pair
          current={
            <Card variant="surface">
              <Stack direction="horizontal" gap="8" wrap>
                <Surface elevation="flat" tint="card" label="flat · box" />
                <Surface elevation="raised" tint="primary" label="fill = variant" />
                <Surface color="#fe8019" label="raw hex" />
              </Stack>
            </Card>
          }
          experimental={
            <>
              <MaterialScene />
              <p {...stylex.props(styles.note)}>
                the well stays matte, the color becomes light, the glass carries it upward
              </p>
            </>
          }
        />
      </Study>
    </div>
  );
}
