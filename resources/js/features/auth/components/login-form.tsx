import { useForm } from "@inertiajs/react";
import { Eye, EyeOff, Loader2, Mail,Lock , Verified} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { route } from "ziggy-js";
export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">Welcome Back</h1>

                    <p className="mt-2 text-slate-500">
                        Sign in to access your society administration portal.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Email Address</Label>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="h-12 pl-11"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Password</Label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                className="h-12 pl-11 pr-11"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {!showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData("remember", Boolean(checked))
                                }
                            />

                            <Label
                                htmlFor="remember"
                                className="cursor-pointer text-sm font-normal"
                            >
                                Keep me signed in
                            </Label>
                        </div>

                        <a
                            href={""}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                        >
                            Forgot Password?
                        </a>
                    </div>

                    <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                        disabled={processing}
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In Securely
                    </Button>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs leading-relaxed text-slate-600">
                            <Verified className="inline h-4 w-4 text-emerald-400" />
                            Your data is protected using encrypted communication
                            and secure authentication.
                        </p>
                    </div>

                    <p className="text-center text-xs leading-relaxed text-slate-500">
                        By signing in, you agree to our{" "}
                        <a href="/terms" className="font-medium">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="font-medium">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
