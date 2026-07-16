# CSS → Tailwind Mapping Reference

Complete lookup table for every CSS property the `TailwindMapper` class handles. When a value is not in the table, fall back to Tailwind's arbitrary value syntax: `property-[value]`.

---

## Display & Visibility

| CSS | Tailwind |
|---|---|
| `display: block` | `block` |
| `display: inline-block` | `inline-block` |
| `display: inline` | `inline` |
| `display: flex` | `flex` |
| `display: inline-flex` | `inline-flex` |
| `display: grid` | `grid` |
| `display: inline-grid` | `inline-grid` |
| `display: table` | `table` |
| `display: none` | `hidden` |
| `display: contents` | `contents` |
| `visibility: hidden` | `invisible` |
| `visibility: visible` | `visible` |
| `opacity: 0` | `opacity-0` |
| `opacity: 0.5` | `opacity-50` |
| `opacity: 1` | `opacity-100` |
| `opacity: 0.75` | `opacity-75` |
| (arbitrary) | `opacity-[0.35]` |

---

## Position

| CSS | Tailwind |
|---|---|
| `position: static` | `static` |
| `position: relative` | `relative` |
| `position: absolute` | `absolute` |
| `position: fixed` | `fixed` |
| `position: sticky` | `sticky` |
| `top: 0` | `top-0` |
| `top: auto` | `top-auto` |
| `top: 50%` | `top-1/2` |
| `inset: 0` | `inset-0` |
| `inset: auto` | `inset-auto` |
| `left: 0; right: 0` | `inset-x-0` |
| `top: 0; bottom: 0` | `inset-y-0` |
| `z-index: 0` | `z-0` |
| `z-index: 10` | `z-10` |
| `z-index: 20` | `z-20` |
| `z-index: 30` | `z-30` |
| `z-index: 40` | `z-40` |
| `z-index: 50` | `z-50` |
| `z-index: auto` | `z-auto` |
| (arbitrary) | `z-[999]` |

---

## Sizing

| CSS | Tailwind |
|---|---|
| `width: 100%` | `w-full` |
| `width: 100vw` | `w-screen` |
| `width: auto` | `w-auto` |
| `width: fit-content` | `w-fit` |
| `width: min-content` | `w-min` |
| `width: max-content` | `w-max` |
| `width: 50%` | `w-1/2` |
| `width: 33.333%` | `w-1/3` |
| `width: 25%` | `w-1/4` |
| `width: 75%` | `w-3/4` |
| `height: 100%` | `h-full` |
| `height: 100vh` | `h-screen` |
| `height: auto` | `h-auto` |
| `height: fit-content` | `h-fit` |
| `min-width: 0` | `min-w-0` |
| `min-width: 100%` | `min-w-full` |
| `max-width: none` | `max-w-none` |
| `max-width: 100%` | `max-w-full` |
| `max-width: 24rem` | `max-w-sm` |
| `max-width: 28rem` | `max-w-md` |
| `max-width: 32rem` | `max-w-lg` |
| `max-width: 36rem` | `max-w-xl` |
| `max-width: 42rem` | `max-w-2xl` |
| `max-width: 48rem` | `max-w-3xl` |
| `max-width: 56rem` | `max-w-4xl` |
| `max-width: 64rem` | `max-w-5xl` |
| `max-width: 72rem` | `max-w-6xl` |
| `max-width: 80rem` | `max-w-7xl` |
| `aspect-ratio: 1 / 1` | `aspect-square` |
| `aspect-ratio: 16 / 9` | `aspect-video` |
| (arbitrary width) | `w-[347px]` |
| (arbitrary height) | `h-[200px]` |

---

## Spacing — Margin & Padding

Tailwind scale: `1=0.25rem(4px)`, `2=0.5rem(8px)`, `3=0.75rem(12px)`, `4=1rem(16px)`, `5=1.25rem`, `6=1.5rem`, `7=1.75rem`, `8=2rem`, `10=2.5rem`, `12=3rem`, `14=3.5rem`, `16=4rem`, `20=5rem`, `24=6rem`, `28=7rem`, `32=8rem`, `36=9rem`, `40=10rem`, `44=11rem`, `48=12rem`, `52=13rem`, `56=14rem`, `60=15rem`, `64=16rem`, `72=18rem`, `80=20rem`, `96=24rem`.

| CSS | Tailwind |
|---|---|
| `padding: 16px` | `p-4` |
| `padding: 8px 16px` | `py-2 px-4` |
| `padding-top: 16px` | `pt-4` |
| `padding-right: 16px` | `pr-4` |
| `padding-bottom: 16px` | `pb-4` |
| `padding-left: 16px` | `pl-4` |
| `padding: 16px 0` | `py-4` |
| `padding: 0 16px` | `px-4` |
| `margin: auto` | `m-auto` |
| `margin: 0 auto` | `mx-auto` |
| `margin-top: 16px` | `mt-4` |
| `margin-top: -16px` | `-mt-4` |
| `gap: 16px` | `gap-4` |
| `gap: 8px 16px` | `gap-y-2 gap-x-4` |
| `column-gap: 16px` | `gap-x-4` |
| `row-gap: 16px` | `gap-y-4` |
| (arbitrary) | `p-[13px]`, `mt-[7px]` |

---

## Flexbox

| CSS | Tailwind |
|---|---|
| `flex-direction: row` | `flex-row` |
| `flex-direction: row-reverse` | `flex-row-reverse` |
| `flex-direction: column` | `flex-col` |
| `flex-direction: column-reverse` | `flex-col-reverse` |
| `flex-wrap: wrap` | `flex-wrap` |
| `flex-wrap: nowrap` | `flex-nowrap` |
| `flex-wrap: wrap-reverse` | `flex-wrap-reverse` |
| `justify-content: flex-start` | `justify-start` |
| `justify-content: center` | `justify-center` |
| `justify-content: flex-end` | `justify-end` |
| `justify-content: space-between` | `justify-between` |
| `justify-content: space-around` | `justify-around` |
| `justify-content: space-evenly` | `justify-evenly` |
| `align-items: flex-start` | `items-start` |
| `align-items: center` | `items-center` |
| `align-items: flex-end` | `items-end` |
| `align-items: stretch` | `items-stretch` |
| `align-items: baseline` | `items-baseline` |
| `align-self: auto` | `self-auto` |
| `align-self: center` | `self-center` |
| `align-content: center` | `content-center` |
| `align-content: space-between` | `content-between` |
| `flex: 1 1 0%` | `flex-1` |
| `flex: 1 1 auto` | `flex-auto` |
| `flex: none` | `flex-none` |
| `flex-grow: 1` | `grow` |
| `flex-grow: 0` | `grow-0` |
| `flex-shrink: 1` | `shrink` |
| `flex-shrink: 0` | `shrink-0` |
| `order: 1` | `order-1` |
| `order: -1` | `-order-1` |
| `order: first` | `order-first` |
| `order: last` | `order-last` |

---

## Grid

| CSS | Tailwind |
|---|---|
| `grid-template-columns: repeat(1, 1fr)` | `grid-cols-1` |
| `grid-template-columns: repeat(2, 1fr)` | `grid-cols-2` |
| `grid-template-columns: repeat(3, 1fr)` | `grid-cols-3` |
| `grid-template-columns: repeat(4, 1fr)` | `grid-cols-4` |
| `grid-template-columns: repeat(5, 1fr)` | `grid-cols-5` |
| `grid-template-columns: repeat(6, 1fr)` | `grid-cols-6` |
| `grid-template-columns: repeat(12, 1fr)` | `grid-cols-12` |
| `grid-column: span 2` | `col-span-2` |
| `grid-column: 1 / -1` | `col-span-full` |
| `grid-row: span 2` | `row-span-2` |
| `grid-column-start: 2` | `col-start-2` |
| `grid-column-end: 4` | `col-end-4` |
| `grid-auto-flow: row` | `grid-flow-row` |
| `grid-auto-flow: column` | `grid-flow-col` |
| `grid-auto-flow: row dense` | `grid-flow-row-dense` |
| `grid-auto-columns: min-content` | `auto-cols-min` |
| `grid-auto-columns: max-content` | `auto-cols-max` |
| `grid-auto-columns: 1fr` | `auto-cols-fr` |
| (arbitrary cols) | `grid-cols-[200px_1fr_2fr]` |

---

## Typography

| CSS | Tailwind |
|---|---|
| `font-size: 0.75rem` (12px) | `text-xs` |
| `font-size: 0.875rem` (14px) | `text-sm` |
| `font-size: 1rem` (16px) | `text-base` |
| `font-size: 1.125rem` (18px) | `text-lg` |
| `font-size: 1.25rem` (20px) | `text-xl` |
| `font-size: 1.5rem` (24px) | `text-2xl` |
| `font-size: 1.875rem` (30px) | `text-3xl` |
| `font-size: 2.25rem` (36px) | `text-4xl` |
| `font-size: 3rem` (48px) | `text-5xl` |
| `font-size: 3.75rem` (60px) | `text-6xl` |
| `font-size: 4.5rem` (72px) | `text-7xl` |
| `font-size: 6rem` (96px) | `text-8xl` |
| `font-size: 8rem` (128px) | `text-9xl` |
| `font-weight: 100` | `font-thin` |
| `font-weight: 200` | `font-extralight` |
| `font-weight: 300` | `font-light` |
| `font-weight: 400` | `font-normal` |
| `font-weight: 500` | `font-medium` |
| `font-weight: 600` | `font-semibold` |
| `font-weight: 700` | `font-bold` |
| `font-weight: 800` | `font-extrabold` |
| `font-weight: 900` | `font-black` |
| `font-style: italic` | `italic` |
| `font-style: normal` | `not-italic` |
| `text-align: left` | `text-left` |
| `text-align: center` | `text-center` |
| `text-align: right` | `text-right` |
| `text-align: justify` | `text-justify` |
| `text-decoration: underline` | `underline` |
| `text-decoration: line-through` | `line-through` |
| `text-decoration: none` | `no-underline` |
| `text-transform: uppercase` | `uppercase` |
| `text-transform: lowercase` | `lowercase` |
| `text-transform: capitalize` | `capitalize` |
| `text-transform: none` | `normal-case` |
| `line-height: 1` | `leading-none` |
| `line-height: 1.25` | `leading-tight` |
| `line-height: 1.375` | `leading-snug` |
| `line-height: 1.5` | `leading-normal` |
| `line-height: 1.625` | `leading-relaxed` |
| `line-height: 2` | `leading-loose` |
| `letter-spacing: -0.05em` | `tracking-tighter` |
| `letter-spacing: -0.025em` | `tracking-tight` |
| `letter-spacing: 0` | `tracking-normal` |
| `letter-spacing: 0.025em` | `tracking-wide` |
| `letter-spacing: 0.05em` | `tracking-wider` |
| `letter-spacing: 0.1em` | `tracking-widest` |
| `white-space: nowrap` | `whitespace-nowrap` |
| `white-space: pre` | `whitespace-pre` |
| `white-space: pre-wrap` | `whitespace-pre-wrap` |
| `overflow-wrap: break-word` | `break-words` |
| `word-break: break-all` | `break-all` |
| `text-overflow: ellipsis` | `truncate` (with `overflow-hidden whitespace-nowrap`) |
| (arbitrary size) | `text-[17px]` |

---

## Colors

Tailwind color format: `{property}-{color}-{shade}` where shade is `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`.

| Property | Tailwind prefix |
|---|---|
| `background-color` | `bg-` |
| `color` | `text-` |
| `border-color` | `border-` |
| `outline-color` | `outline-` |
| `ring color` | `ring-` |
| `caret-color` | `caret-` |
| `accent-color` | `accent-` |
| `fill` | `fill-` |
| `stroke` | `stroke-` |
| `text-decoration-color` | `decoration-` |
| `box-shadow color` | `shadow-` (v3: limited; v4: `shadow-{color}`) |

**Alpha / opacity modifier** (Tailwind v3+):
- `background-color: rgba(0,0,0,0.5)` → `bg-black/50`
- `color: rgba(255,255,255,0.8)` → `text-white/80`
- `border-color: rgba(99,102,241,0.3)` → `border-indigo-500/30`

**Non-palette hex colors** → arbitrary values:
- `color: #1a2b3c` → `text-[#1a2b3c]`
- `background-color: #ff6b6b` → `bg-[#ff6b6b]`

---

## Backgrounds — Inset & Advanced

| CSS | Tailwind |
|---|---|
| `background-size: cover` | `bg-cover` |
| `background-size: contain` | `bg-contain` |
| `background-size: auto` | `bg-auto` |
| `background-position: center` | `bg-center` |
| `background-position: top` | `bg-top` |
| `background-position: bottom` | `bg-bottom` |
| `background-position: left` | `bg-left` |
| `background-position: right` | `bg-right` |
| `background-position: left top` | `bg-left-top` |
| `background-repeat: no-repeat` | `bg-no-repeat` |
| `background-repeat: repeat` | `bg-repeat` |
| `background-repeat: repeat-x` | `bg-repeat-x` |
| `background-repeat: repeat-y` | `bg-repeat-y` |
| `background-attachment: fixed` | `bg-fixed` |
| `background-attachment: local` | `bg-local` |
| `background-attachment: scroll` | `bg-scroll` |
| `background-clip: border-box` | `bg-clip-border` |
| `background-clip: padding-box` | `bg-clip-padding` |
| `background-clip: content-box` | `bg-clip-content` |
| `background-clip: text` | `bg-clip-text text-transparent` |
| `background-image: url(...)` | `bg-[url('/path')]` |
| (arbitrary position) | `bg-[23%_45%]` |
| (arbitrary size) | `bg-[100px_200px]` |

**Gradients:**

| CSS | Tailwind |
|---|---|
| `linear-gradient(to bottom, ...)` | `bg-gradient-to-b` |
| `linear-gradient(to top, ...)` | `bg-gradient-to-t` |
| `linear-gradient(to right, ...)` | `bg-gradient-to-r` |
| `linear-gradient(to left, ...)` | `bg-gradient-to-l` |
| `linear-gradient(to bottom right, ...)` | `bg-gradient-to-br` |
| `linear-gradient(to top right, ...)` | `bg-gradient-to-tr` |
| `from: #hex` | `from-[#hex]` |
| `via: #hex` | `via-[#hex]` |
| `to: #hex` | `to-[#hex]` |
| `from-opacity` | `from-blue-500/50` |

**Layered backgrounds** (multiple background-image values):
CSS `background` shorthand with multiple layers must be split into a base layer + `::before` pseudo-element for the overlay. Document this in the `REVIEW.md` output.

---

## Borders

| CSS | Tailwind |
|---|---|
| `border-width: 1px` | `border` |
| `border-width: 2px` | `border-2` |
| `border-width: 4px` | `border-4` |
| `border-width: 0` | `border-0` |
| `border-top-width: 1px` | `border-t` |
| `border-right-width: 1px` | `border-r` |
| `border-bottom-width: 1px` | `border-b` |
| `border-left-width: 1px` | `border-l` |
| `border-style: solid` | `border-solid` |
| `border-style: dashed` | `border-dashed` |
| `border-style: dotted` | `border-dotted` |
| `border-style: none` | `border-none` |
| `border-radius: 0` | `rounded-none` |
| `border-radius: 2px` | `rounded-sm` |
| `border-radius: 4px` | `rounded` |
| `border-radius: 6px` | `rounded-md` |
| `border-radius: 8px` | `rounded-lg` |
| `border-radius: 12px` | `rounded-xl` |
| `border-radius: 16px` | `rounded-2xl` |
| `border-radius: 24px` | `rounded-3xl` |
| `border-radius: 9999px` | `rounded-full` |
| `border-top-left-radius: ...` | `rounded-tl-*` |
| `border-top-right-radius: ...` | `rounded-tr-*` |
| `border-bottom-left-radius: ...` | `rounded-bl-*` |
| `border-bottom-right-radius: ...` | `rounded-br-*` |
| (arbitrary radius) | `rounded-[10px]` |
| `outline: none` | `outline-none` |
| `outline: 2px solid currentColor` | `outline` |
| `outline-offset: 2px` | `outline-offset-2` |

**Ring (focus ring):**

| CSS | Tailwind |
|---|---|
| `box-shadow: 0 0 0 3px rgba(...)` | `ring-3` (v4) or `ring` (v3 = 3px) |
| `box-shadow: 0 0 0 1px ...` | `ring-1` |
| `box-shadow: 0 0 0 2px ...` | `ring-2` |
| `ring color` | `ring-blue-500` |
| `ring opacity` | `ring-blue-500/50` |
| `ring inset` | `ring-inset` |
| `ring offset` | `ring-offset-2` |

---

## Shadows

Standard:

| CSS | Tailwind |
|---|---|
| `box-shadow: none` | `shadow-none` |
| `box-shadow: 0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` |
| `box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | `shadow` |
| `box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | `shadow-md` |
| `box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | `shadow-lg` |
| `box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | `shadow-xl` |
| `box-shadow: 0 25px 50px rgba(0,0,0,0.25)` | `shadow-2xl` |
| `box-shadow: inset 0 2px 4px rgba(0,0,0,0.06)` | `shadow-inner` |

Non-standard shadows → arbitrary value:
```
box-shadow: 0 8px 32px rgba(31,38,135,0.37)
→ shadow-[0_8px_32px_rgba(31,38,135,0.37)]
```

Colored shadows (Tailwind v3 with plugin or v4):
- `box-shadow: 0 4px 14px rgba(99,102,241,0.4)` → `shadow-lg shadow-indigo-500/40`

**Inset shadow rule:**
- Always check `box-shadow` for the `inset` keyword
- `inset 0 2px 4px rgba(0,0,0,0.1)` → `shadow-inner`
- Any other inset value → `shadow-[inset_...]` (spaces become `_`)

---

## Transforms

| CSS | Tailwind |
|---|---|
| `transform: none` | `transform-none` |
| `transform-origin: center` | `origin-center` |
| `transform-origin: top` | `origin-top` |
| `transform-origin: bottom` | `origin-bottom` |
| `transform-origin: left` | `origin-left` |
| `transform-origin: right` | `origin-right` |
| `scale(1.05)` | `scale-105` |
| `scale(0.95)` | `scale-95` |
| `scale(0)` | `scale-0` |
| `scaleX(...)` | `scale-x-*` |
| `scaleY(...)` | `scale-y-*` |
| `rotate(45deg)` | `rotate-45` |
| `rotate(-45deg)` | `-rotate-45` |
| `rotate(90deg)` | `rotate-90` |
| `rotate(180deg)` | `rotate-180` |
| `translateX(10px)` | `translate-x-[10px]` or `translate-x-2.5` |
| `translateY(-50%)` | `-translate-y-1/2` |
| `skewX(6deg)` | `skew-x-6` |
| `skewY(6deg)` | `skew-y-6` |
| (arbitrary) | `rotate-[17deg]`, `translate-x-[23px]` |

---

## Transitions & Animations

| CSS | Tailwind |
|---|---|
| `transition: all 150ms cubic-bezier(0.4,0,0.2,1)` | `transition` |
| `transition-property: color, background-color, ...` | `transition-colors` |
| `transition-property: opacity` | `transition-opacity` |
| `transition-property: box-shadow` | `transition-shadow` |
| `transition-property: transform` | `transition-transform` |
| `transition-property: all` | `transition-all` |
| `transition-property: none` | `transition-none` |
| `transition-duration: 75ms` | `duration-75` |
| `transition-duration: 100ms` | `duration-100` |
| `transition-duration: 150ms` | `duration-150` |
| `transition-duration: 200ms` | `duration-200` |
| `transition-duration: 300ms` | `duration-300` |
| `transition-duration: 500ms` | `duration-500` |
| `transition-duration: 700ms` | `duration-700` |
| `transition-duration: 1000ms` | `duration-1000` |
| `transition-timing-function: linear` | `ease-linear` |
| `transition-timing-function: cubic-bezier(0.4,0,1,1)` | `ease-in` |
| `transition-timing-function: cubic-bezier(0,0,0.2,1)` | `ease-out` |
| `transition-timing-function: cubic-bezier(0.4,0,0.2,1)` | `ease-in-out` |
| `transition-delay: 75ms` | `delay-75` |
| `transition-delay: 100ms` | `delay-100` |
| `transition-delay: 150ms` | `delay-150` |
| `transition-delay: 200ms` | `delay-200` |
| `transition-delay: 300ms` | `delay-300` |
| `transition-delay: 500ms` | `delay-500` |
| (arbitrary duration) | `duration-[400ms]` |
| (arbitrary easing) | `ease-[cubic-bezier(0.25,0.1,0.25,1)]` |

**Animations:**

| CSS | Tailwind |
|---|---|
| `animation: spin 1s linear infinite` | `animate-spin` |
| `animation: ping 1s cubic-bezier(0,0,0.2,1) infinite` | `animate-ping` |
| `animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite` | `animate-pulse` |
| `animation: bounce 1s infinite` | `animate-bounce` |
| `animation: none` | `animate-none` |
| Custom `@keyframes` | `animate-[name]` + note in REVIEW.md with keyframe body |

---

## Filters

| CSS | Tailwind |
|---|---|
| `filter: blur(0)` | `blur-none` |
| `filter: blur(4px)` | `blur-sm` |
| `filter: blur(8px)` | `blur` |
| `filter: blur(12px)` | `blur-md` |
| `filter: blur(16px)` | `blur-lg` |
| `filter: blur(24px)` | `blur-xl` |
| `filter: blur(40px)` | `blur-2xl` |
| `filter: blur(64px)` | `blur-3xl` |
| `filter: brightness(0)` | `brightness-0` |
| `filter: brightness(0.5)` | `brightness-50` |
| `filter: brightness(1)` | `brightness-100` |
| `filter: brightness(1.25)` | `brightness-125` |
| `filter: contrast(0)` | `contrast-0` |
| `filter: contrast(0.5)` | `contrast-50` |
| `filter: grayscale(100%)` | `grayscale` |
| `filter: grayscale(0)` | `grayscale-0` |
| `filter: hue-rotate(180deg)` | `hue-rotate-180` |
| `filter: invert(100%)` | `invert` |
| `filter: saturate(0)` | `saturate-0` |
| `filter: saturate(200%)` | `saturate-200` |
| `filter: sepia(100%)` | `sepia` |
| `filter: drop-shadow(...)` | `drop-shadow-*` |
| (arbitrary) | `blur-[3px]`, `brightness-[0.8]` |

**Backdrop filters:**

| CSS | Tailwind |
|---|---|
| `backdrop-filter: blur(0)` | `backdrop-blur-none` |
| `backdrop-filter: blur(4px)` | `backdrop-blur-sm` |
| `backdrop-filter: blur(8px)` | `backdrop-blur` |
| `backdrop-filter: blur(12px)` | `backdrop-blur-md` |
| `backdrop-filter: blur(16px)` | `backdrop-blur-lg` |
| `backdrop-filter: blur(24px)` | `backdrop-blur-xl` |
| `backdrop-filter: blur(40px)` | `backdrop-blur-2xl` |
| `backdrop-filter: blur(64px)` | `backdrop-blur-3xl` |
| `backdrop-filter: brightness(0.8)` | `backdrop-brightness-80` |
| `backdrop-filter: saturate(180%)` | `backdrop-saturate-[180%]` |

---

## Overflow & Scrolling

| CSS | Tailwind |
|---|---|
| `overflow: hidden` | `overflow-hidden` |
| `overflow: visible` | `overflow-visible` |
| `overflow: auto` | `overflow-auto` |
| `overflow: scroll` | `overflow-scroll` |
| `overflow-x: hidden` | `overflow-x-hidden` |
| `overflow-y: auto` | `overflow-y-auto` |
| `overflow-y: scroll` | `overflow-y-scroll` |
| `-webkit-overflow-scrolling: touch` | `overflow-y-auto` (modern browsers handle this) |
| `scroll-behavior: smooth` | `scroll-smooth` |
| `scroll-snap-type: x mandatory` | `snap-x snap-mandatory` |
| `scroll-snap-align: start` | `snap-start` |
| `scroll-snap-align: center` | `snap-center` |
| `scroll-snap-align: end` | `snap-end` |
| `overscroll-behavior: contain` | `overscroll-contain` |
| `overscroll-behavior: none` | `overscroll-none` |

---

## Interactivity

| CSS | Tailwind |
|---|---|
| `cursor: pointer` | `cursor-pointer` |
| `cursor: default` | `cursor-default` |
| `cursor: not-allowed` | `cursor-not-allowed` |
| `cursor: wait` | `cursor-wait` |
| `cursor: grab` | `cursor-grab` |
| `cursor: text` | `cursor-text` |
| `cursor: crosshair` | `cursor-crosshair` |
| `pointer-events: none` | `pointer-events-none` |
| `pointer-events: auto` | `pointer-events-auto` |
| `user-select: none` | `select-none` |
| `user-select: text` | `select-text` |
| `user-select: all` | `select-all` |
| `user-select: auto` | `select-auto` |
| `resize: none` | `resize-none` |
| `resize: both` | `resize` |
| `resize: vertical` | `resize-y` |
| `resize: horizontal` | `resize-x` |
| `appearance: none` | `appearance-none` |
| `touch-action: manipulation` | `touch-manipulation` |

---

## Pseudo-element Content

When `::before` or `::after` is detected with meaningful styles, map as:

```
before:content-[''] before:absolute before:inset-0 before:bg-black/50
```

Always add `relative` to the parent when using absolute pseudo-elements.

---

## CSS Variables

When a CSS custom property (`var(--x)`) is encountered:

1. Check if it resolves to a color/value you can detect from the source stylesheet
2. If resolvable → substitute the resolved value
3. If not resolvable → `text-[var(--x)]` or `bg-[var(--x)]`
4. Document all `var()` references in `REVIEW.md` under "CSS Variables"

---

## Tailwind v4 Differences

If user selected Tailwind v4:
- `ring` default = 1px (was 3px in v3)
- Use `inset-shadow-*` for inset shadows (native in v4)
- Colors are CSS variables by default — custom colors go in `@theme` block not `tailwind.config.js`
- `text-shadow-*` utilities are available natively
- `transition` shorthand covers more properties by default
- Arbitrary variant syntax: `[&:nth-child(3)]:text-red-500`
