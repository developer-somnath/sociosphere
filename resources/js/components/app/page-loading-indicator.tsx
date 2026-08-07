import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export function PageLoadingIndicator() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer: number | undefined;
        const removeStart = router.on("start", () => {
            timer = window.setTimeout(() => setVisible(true), 150);
        });
        const finish = () => {
            if (timer) window.clearTimeout(timer);
            setVisible(false);
        };
        const removeFinish = router.on("finish", finish);
        const removeError = router.on("error", finish);

        return () => {
            if (timer) window.clearTimeout(timer);
            removeStart();
            removeFinish();
            removeError();
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className={`fixed inset-x-0 top-0 z-[110] h-0.5 origin-left bg-primary transition-transform duration-300 ${visible ? "scale-x-100" : "scale-x-0"}`}
        />
    );
}
