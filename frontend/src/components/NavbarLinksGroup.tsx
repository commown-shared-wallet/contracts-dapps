import React, { useState } from "react";
import {
    Group,
    Box,
    Collapse,
    ThemeIcon,
    Text,
    UnstyledButton,
    createStyles,
    ActionIcon,
} from "@mantine/core";
import {
    Icon as TablerIcon,
    CalendarStats,
    ChevronLeft,
    ChevronRight,
} from "tabler-icons-react";
import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    control: {
        fontWeight: 500,
        display: "block",
        width: "100%",
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        color:
            theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
        fontSize: theme.fontSizes.sm,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
    },

    link: {
        fontWeight: 500,
        display: "block",
        textDecoration: "none",
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        paddingLeft: 0,
        marginLeft: 30,
        fontSize: theme.fontSizes.sm,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
    },

    subLink: {
        fontWeight: 500,
        display: "block",
        textDecoration: "none",
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        paddingLeft: 31,
        marginLeft: 30,
        fontSize: theme.fontSizes.sm,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
        borderLeft: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[3]
        }`,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
    },

    chevron: {
        transition: "transform 200ms ease",
    },
}));

interface LinksGroupProps {
    icon: TablerIcon;
    label: string;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string }[];
}

export function LinksGroup({
    icon: Icon,
    label,
    link,
    initiallyOpened,
    links,
}: LinksGroupProps) {
    const { classes, theme } = useStyles();
    const hasLinks = Array.isArray(links);
    const [opened, setOpened] = useState(initiallyOpened || false);
    const ChevronIcon = theme.dir === "ltr" ? ChevronRight : ChevronLeft;
    const items = (hasLinks ? links : []).map((link) => (
        <Text
            component={Link}
            variant="link"
            className={classes.subLink}
            to={link.link}
            key={link.label}
        >
            {link.label}
        </Text>
    ));

    return (
        <>
            {!link ? (
                <UnstyledButton
                    onClick={() => setOpened((o) => !o)}
                    className={classes.control}
                >
                    <Group position="apart" spacing={0}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ThemeIcon variant="light" size={30}>
                                <Icon size={18} />
                            </ThemeIcon>
                            <Box className={classes.link} ml="md">
                                {label}
                            </Box>
                        </Box>
                        {hasLinks && (
                            <ChevronIcon
                                className={classes.chevron}
                                size={14}
                                style={{
                                    transform: opened
                                        ? `rotate(${
                                              theme.dir === "rtl" ? -90 : 90
                                          }deg)`
                                        : "none",
                                }}
                            />
                        )}
                    </Group>
                </UnstyledButton>
            ) : null}
            {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
            {link ? (
                <UnstyledButton
                    component={Link}
                    to={link ? link : ""}
                    className={classes.control}
                >
                    <Group position="apart" spacing={0}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ThemeIcon variant="light" size={30}>
                                <Icon size={18} />
                            </ThemeIcon>
                            <Box className={classes.link} ml="md">
                                {label}
                            </Box>
                        </Box>
                    </Group>
                </UnstyledButton>
            ) : null}
        </>
    );
}

const mockdata = {
    label: "Releases",
    icon: CalendarStats,
    links: [
        { label: "Upcoming releases", link: "/" },
        { label: "Previous releases", link: "/" },
        { label: "Releases schedule", link: "/" },
    ],
};
