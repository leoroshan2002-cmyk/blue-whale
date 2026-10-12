import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PageBack() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-sm text-zinc-500 hover:text-black transition"
        >
            <ChevronLeft size={18} />
            <span>Back</span>
        </button>
    );
}