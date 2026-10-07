/*
 * Fly-to-cart: burst at the button, a glossy comet-dot with a tail that
 * stretches as it speeds up, then a shockwave + sparks + "+1" at the cart.
 * Flies to EVERY visible element with the attribute  data-cart-target.
 */

const DURATION = 900; // ms
const SIZE = 18; // dot size in px
const TRAIL = 6; // number of tail ghosts
const COLORS = ["#d61f1f", "#ff6b6b", "#ffd166", "#ffffff"];

const rand = (a, b) => a + Math.random() * (b - a);

function center(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function bump(el) {
    el.classList.remove("cart-bump");
    void el.offsetWidth; // restart the animation if it is already running
    el.classList.add("cart-bump");
    setTimeout(() => el.classList.remove("cart-bump"), 600);

    const badge = el.querySelector(".badge, .cart-badge");
    if (badge) {
        badge.classList.remove("badge-pop");
        void badge.offsetWidth;
        badge.classList.add("badge-pop");
        setTimeout(() => badge.classList.remove("badge-pop"), 700);
    }
}

/* expanding shockwave ring */
function ring(x, y, size = 44, duration = 650) {
    const el = document.createElement("div");
    el.className = "fly-ring";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px`;
    document.body.appendChild(el);
    el.animate(
        [
            { transform: "scale(0.2)", opacity: 0.9 },
            { transform: "scale(2.6)", opacity: 0 },
        ],
        { duration, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
    ).onfinish = () => el.remove();
}

/* little sparks flying out in every direction */
function sparks(x, y, count = 10, dist = 50) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
        const d = rand(dist * 0.5, dist);
        const size = rand(4, 8);
        const el = document.createElement("div");
        el.className = "fly-spark";
        el.setAttribute("aria-hidden", "true");
        el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:${COLORS[i % COLORS.length]
            }`;
        document.body.appendChild(el);
        el.animate(
            [
                { transform: "translate(0, 0) scale(1)", opacity: 1 },
                {
                    transform: `translate(${Math.cos(angle) * d}px, ${Math.sin(angle) * d}px) scale(0)`,
                    opacity: 0,
                },
            ],
            { duration: rand(450, 750), easing: "cubic-bezier(0.15, 0.8, 0.3, 1)" }
        ).onfinish = () => el.remove();
    }
}

/* floating "+1" */
function plusOne(x, y) {
    const el = document.createElement("div");
    el.className = "fly-plus";
    el.setAttribute("aria-hidden", "true");
    el.textContent = "+1";
    el.style.cssText = `left:${x - 14}px;top:${y - 34}px`;
    document.body.appendChild(el);
    el.animate(
        [
            { transform: "translateY(10px) scale(0.5)", opacity: 0 },
            { transform: "translateY(-6px) scale(1.2)", opacity: 1, offset: 0.3 },
            { transform: "translateY(-44px) scale(1)", opacity: 0 },
        ],
        { duration: 900, easing: "ease-out" }
    ).onfinish = () => el.remove();
}

export function flyToCart(sourceEl) {
    if (!sourceEl) return;

    const targets = [...document.querySelectorAll("[data-cart-target]")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0; // skip hidden ones
    });
    if (!targets.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
        targets.forEach(bump);
        return;
    }

    const start = center(sourceEl.getBoundingClientRect());

    /* 1. launch: button squishes, ring + sparks burst from it */
    sourceEl.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.93)" }, { transform: "scale(1)" }],
        { duration: 240, easing: "ease-out" }
    );
    ring(start.x, start.y, 40, 520);
    sparks(start.x, start.y, 8, 34);

    targets.forEach((target, index) => {
        const end = center(target.getBoundingClientRect());
        // navbar is hidden (scrolled out of view): fly to the top edge instead
        if (end.y < 0) end.y = 24;

        // curved path (quadratic bezier) that arcs upward
        const ctrl = {
            x: (start.x + end.x) / 2,
            y: Math.min(start.y, end.y) - 160,
        };

        /* frames: position on curve, rotated along the direction of travel,
           stretched when fast (middle of the path), shrinking toward the end */
        const buildFrames = (scaleMul, opMul) => {
            const steps = 40;
            const frames = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const u = 1 - t;
                const x = u * u * start.x + 2 * u * t * ctrl.x + t * t * end.x;
                const y = u * u * start.y + 2 * u * t * ctrl.y + t * t * end.y;
                const dx = 2 * u * (ctrl.x - start.x) + 2 * t * (end.x - ctrl.x);
                const dy = 2 * u * (ctrl.y - start.y) + 2 * t * (end.y - ctrl.y);
                const angle = Math.atan2(dy, dx);
                const speed = Math.sin(Math.PI * t);
                const s = (1.15 - 0.6 * t) * scaleMul;
                frames.push({
                    transform: `translate(${x - SIZE / 2}px, ${y - SIZE / 2}px) rotate(${angle}rad) scale(${s * (1 + 0.9 * speed)
                        }, ${s * (1 - 0.25 * speed)})`,
                    opacity: (t > 0.94 ? 0.5 : 1) * opMul,
                });
            }
            return frames;
        };

        /* 2. comet tail: ghosts that follow the same path a little later */
        for (let g = TRAIL; g >= 1; g--) {
            const ghost = document.createElement("div");
            ghost.className = "fly-dot fly-dot--ghost";
            ghost.setAttribute("aria-hidden", "true");
            document.body.appendChild(ghost);
            ghost.animate(buildFrames(1 - g * 0.1, 0.55 - g * 0.07), {
                duration: DURATION,
                delay: g * 38,
                easing: "cubic-bezier(0.5, 0, 0.3, 1)",
                fill: "both",
            }).onfinish = () => ghost.remove();
        }

        /* 3. the main glossy dot */
        const dot = document.createElement("div");
        dot.className = "fly-dot";
        dot.setAttribute("aria-hidden", "true");
        document.body.appendChild(dot);

        dot.animate(buildFrames(1, 1), {
            duration: DURATION,
            easing: "cubic-bezier(0.5, 0, 0.3, 1)",
            fill: "forwards",
        }).onfinish = () => {
            dot.remove();

            /* 4. landing: shockwave, sparks, +1, icon pops, badge pops */
            ring(end.x, end.y, 48, 700);
            sparks(end.x, end.y, 12, 56);
            plusOne(end.x, end.y);
            bump(target);
            if (index === 0 && navigator.vibrate) navigator.vibrate(15);
        };
    });
}

export default flyToCart;