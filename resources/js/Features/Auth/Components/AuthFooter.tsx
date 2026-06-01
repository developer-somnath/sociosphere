export default function AuthFooter() {
    return (
        <div
            className="
                mt-8
                text-center
                text-xs
                text-slate-500
                space-y-2
            "
        >
            <div className="flex justify-center gap-4">

                <a
                    href="/privacy-policy"
                    className="hover:text-slate-700"
                >
                    Privacy Policy
                </a>

                <span>•</span>

                <a
                    href="/terms-and-conditions"
                    className="hover:text-slate-700"
                >
                    Terms & Conditions
                </a>

                <span>•</span>

                <a
                    href="/disclaimer"
                    className="hover:text-slate-700"
                >
                    Disclaimer
                </a>

            </div>

            <p>
                © {new Date().getFullYear()} SocioSphere.
                All rights reserved.
            </p>

            <p>
                Powered by{" "}
                <a
                    href="https://www.sociosphere.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                        text-emerald-600
                        font-medium
                        hover:underline
                    "
                >

                </a>
            </p>
        </div>
    );
}
