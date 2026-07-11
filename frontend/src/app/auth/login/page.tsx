"use client";

import {useState} from "react";
import {supabase} from "@/lib/supabase/client";


export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    async function handleLogin(e: React.FormEvent){
        e.preventDefault();

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        console.log(error.message);
        return;
    }
    window.location.href= "/dashboard";     //Redirects to dashboard page after successful login

    }

    return (
        <main className= " min-h-screen flex items-center  justify-center">
            <div className="w-full max-w-md">
                <h1 className= "text-3xl font-bold mb-6">
                    KettyFleet Login
                </h1>

                <form
                onSubmit={handleLogin}
                className="space-y-4">

                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-3 rounded"
                    />

                    <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-3 rounded"
                    />
                    

                    <button
                         className="w-full bg-blue-500 hover:bg-blue-600 text-white border p-3 rounded">
                            Login
                            </button>
                         
                </form>
            </div>
        </main>
    );
}