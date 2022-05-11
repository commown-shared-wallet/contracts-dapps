import { useNotifications } from "@mantine/notifications";

export function useCopy() {
    /**Mantine UI */
    const notifications = useNotifications();

    function copyElement(element: string | null | undefined) {
        /* Mantine Value */
        notifications.showNotification({
            id: "Copy",
            color: "green",
            message: `This ${typeof element} has been copied : ${element}`,
        });
        return navigator.clipboard.writeText(element || "");
    }

    return [copyElement];
}
