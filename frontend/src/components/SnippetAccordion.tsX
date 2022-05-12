import { Group, Avatar, Text, Accordion, Table } from "@mantine/core";
import { ReactElement } from "react";

interface AccordionLabelProps {
    label: string;
    icon: ReactElement;
    description?: ReactElement | string;
    content?: string;
}

function AccordionLabel({ label, icon, description }: AccordionLabelProps) {
    return (
        <Group noWrap>
            {icon}
            <div>
                <Text>{label}</Text>
                {description ? (
                    <Text size="sm" color="dimmed" weight={400}>
                        {description}
                    </Text>
                ) : null}
            </div>
        </Group>
    );
}

type HeadCell<DataType> = {
    id: Extract<keyof DataType, string>;
    label: string;
};

type TableProps<DataType> = {
    labelElement: Array<AccordionLabelProps>;
    heads: HeadCell<DataType>[];
    rows: Array<DataType>;
};

export function SnippetAccordion<T>({
    labelElement,
    heads,
    rows,
}: TableProps<T>) {
    const ColumnsKeys = heads.map((item: HeadCell<T>) => item.id);

    const items = labelElement.map((item) => (
        <Accordion.Item label={<AccordionLabel {...item} />} key={item.label}>
            {item.content ? <Text size="sm">{item.content}</Text> : null}
            <Table>
                <thead>
                    <tr>
                        {heads.map((head, headKey) => {
                            return <th key={headKey}>{head.label}</th>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowKey) => {
                        return (
                            <tr key={rowKey}>
                                {ColumnsKeys.map(
                                    (column: keyof T, columnKey) => {
                                        return (
                                            <td
                                                style={{ textAlign: "center" }}
                                                key={columnKey}
                                            >
                                                {row[column]}
                                            </td>
                                        );
                                    }
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Accordion.Item>
    ));

    return (
        <Accordion initialItem={0} iconPosition="right">
            {items}
        </Accordion>
    );
}
