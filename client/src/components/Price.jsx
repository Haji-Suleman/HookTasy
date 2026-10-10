import { money } from "../StoreContext";

export default function Price({ p }) {
    return (
        <p className="price">
            {money(p.price)}
            {p.compare > p.price && <s>{money(p.compare)}</s>}
        </p>
    );
}