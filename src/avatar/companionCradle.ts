import type { Box, Part } from './render'
import { dogCradleShape } from './dogCradle'

// Kesimler, 640 px poz çizimindeki yaka, pati ve önkol çizgilerini izler.
const HEAD = 'M0 0 H640 V374 H355 L343 398 Q308 423 261 389 L252 372 H0 Z'
const BODY = 'M0 355 H241 Q250 365 262 367 L258 375 Q297 423 348 402 L411 386 H640 V640 H0 Z'
const NECK = 'M241 342 H356 L356 390 Q341 411 309 409 Q277 404 253 377 Z'
const RABBIT_AND_ARMS = [
  'M335 365 Q339 350 356 337 Q368 318 390 313 Q406 298 433 304',
  'Q440 272 479 247 Q506 232 516 243 L548 306 L490 340 L463 343',
  'Q460 353 466 374 Q478 396 465 408 Q455 420 442 425',
  'Q462 439 477 467 Q506 505 517 540 L521 593 L504 621 L443 610',
  'L414 572 Q337 610 249 618 Q196 626 178 606',
  'L158 524 Q205 502 253 508 L258 539 L288 533 Q277 530 283 505',
  'Q289 484 310 459 L333 444 Q327 432 336 420 Q318 398 335 365 Z',
].join(' ')
const ARMS = [
  'M161 524 Q204 504 253 510 L258 537 Q278 529 301 537',
  'Q333 550 383 531 L387 524 Q359 521 361 509',
  'Q345 500 358 490 Q350 479 370 469 Q375 456 407 447 Q434 440 453 448',
  'Q473 454 493 494 Q518 533 521 563 L511 595 L492 609',
  'L445 610 L422 572 Q364 600 294 610 Q202 631 180 608 Z',
].join(' ')
const SHIRT = [
  'M118 359 H475 L519 439 L520 517 L440 574 Q436 592 447 606',
  'Q451 625 396 634 Q325 648 223 635 Q174 629 174 608 L181 558 L124 554 Z',
].join(' ')

export interface CradleShape {
  src: string
  body: string
  contact: string
  arms: string
  shirt: string
  sleeves: [Sleeve, Sleeve]
}

type Sleeve = Omit<NonNullable<Part['fabric']>, 'crop'> & { clip: string }

const CRADLES: Partial<Record<string, CradleShape>> = {
  rabbit: {
    src: 'pose/rabbit-cradle.webp', body: BODY, contact: RABBIT_AND_ARMS, arms: ARMS, shirt: SHIRT,
    sleeves: [
      { clip: 'M165 527 Q201 504 253 511 L260 535 Q279 526 306 534 Q352 547 398 534 Q409 553 415 577 Q331 611 237 613 Q188 616 179 595 Q167 572 165 527 Z', center: [281, 560], width: 160, length: 278, angle: -96 },
      { clip: 'M451 525 Q477 531 486 500 Q511 527 508 558 Q500 594 474 599 Q451 602 438 580 Q453 551 451 525 Z', center: [480, 549], width: 110, length: 126, angle: 154 },
    ],
  },
  cat: {
    src: 'pose/cat-cradle.webp',
    body: BODY,
    contact: [
      'M335 379 L333 369 Q342 366 353 358 L346 354 Q359 350 370 339',
      'Q385 324 403 322 Q422 292 438 284 Q457 273 460 326',
      'Q492 305 508 303 Q526 299 532 316 L525 413 L467 431',
      'L498 460 L524 490 L535 544 L536 608 L440 609 L435 585',
      'Q385 609 308 619 Q192 630 150 608 L133 527 L141 505',
      'Q155 493 187 490 Q201 465 225 462 Q238 458 254 467',
      'Q285 438 342 440 Q344 427 350 414 L337 399 Z',
    ].join(' '),
    arms: [
      'M142 502 Q160 493 188 494 Q178 513 185 543 Q199 563 230 561',
      'Q281 562 309 551 Q326 529 346 527 Q375 526 396 517',
      'Q411 512 423 516 Q435 513 440 509 L445 514',
      'Q448 563 414 578 Q373 600 310 604 Q221 622 168 609 Q146 601 142 559 Z',
      'M388 451 Q397 430 420 422 Q434 415 449 422 Q477 423 492 458',
      'Q507 479 518 515 Q535 552 514 585 Q494 610 468 594',
      'Q450 585 443 578 Q457 551 446 503 Q430 486 411 483',
      'Q391 480 399 469 Q384 467 389 458 Z',
    ].join(' '),
    shirt: SHIRT,
    sleeves: [
      { clip: 'M143 504 Q166 491 189 495 Q175 534 199 552 Q230 574 312 551 Q330 572 342 598 Q255 617 198 608 Q151 609 145 566 Z', center: [235, 551], width: 156, length: 232, angle: -88 },
      { clip: 'M451 491 Q475 492 482 467 Q505 487 519 536 Q532 565 505 588 Q483 609 457 585 L443 573 Q443 552 451 532 Z', center: [483, 532], width: 132, length: 150, angle: 162 },
    ],
  },
  dog: { src: 'pose/dog-cradle.webp', ...dogCradleShape },
}

export const cradleFor = (animal: string): CradleShape | undefined => CRADLES[animal]

// Her kumaş, ilgili kıyafetin sol kolundaki opak bölgeden örneklenir.
const FABRIC: Partial<Record<string, Box>> = {
  'clothes/astronaut.webp': [121, 440, 32, 68],
  'clothes/blazer.webp': [128, 435, 38, 72],
  'clothes/collared_sweater.webp': [136, 436, 28, 71],
  'clothes/dinosaur.webp': [128, 428, 40, 79],
  'clothes/doctor.webp': [124, 437, 25, 71],
  'clothes/hoodie.webp': [127, 415, 35, 91],
  'clothes/knight.webp': [117, 473, 38, 34],
  'clothes/superhero.webp': [150, 419, 28, 89],
  'clothes/tracksuit.webp': [133, 416, 33, 91],
  'clothes/winter_coat.webp': [0, 0, 512, 512],
}

function sleeveParts(sleeves: Sleeve[], garment: Part | null): Part[] {
  const crop = garment && FABRIC[garment.src]
  if (!garment || !crop) return []
  const cloth: Part = garment.src === 'clothes/winter_coat.webp'
    ? { ...garment, src: 'clothes/winter-coat-sleeve.webp', mask: undefined, ref: 114 }
    : garment
  return sleeves.map(({ clip, ...placement }) => ({
    ...cloth,
    clip,
    fabric: { crop, ...placement },
  }))
}

const HUG_WRISTS: [Sleeve, Sleeve] = [
  { clip: 'M225 608 Q257 615 290 608 Q282 622 281 640 H214 Z', center: [252, 623], width: 78, length: 38, angle: 180 },
  { clip: 'M346 608 Q377 615 412 608 L421 640 H356 Z', center: [384, 623], width: 78, length: 38, angle: 180 },
]

export const hugSleeves = (garment: Part | null) => sleeveParts(HUG_WRISTS, garment)

// Papağan katmanında bilek sağ alt köşeye doğru uzanır.
const PARROT_WRIST: Sleeve = {
  clip: 'M477 613 Q504 622 531 607 L565 640 H498 Q492 625 477 613 Z',
  center: [520, 625], width: 88, length: 60, angle: 141,
}

export const parrotGripSleeve = (garment: Part | null) => sleeveParts([PARROT_WRIST], garment)

function atHead(part: Part): Part {
  const scale = 0.95
  // Sivri şapkanın ucu tuvalde kalsın, siperlik aynı yükseklikte dursun.
  const wizard = part.src === 'hat/wizard.webp'
  return {
    ...part,
    dx: -12.8 + (part.dx ?? 0) * scale,
    dy: (wizard ? -42 : -30.4) + (part.dy ?? 0) * scale,
    scale: scale * (part.scale ?? 1),
    ...(wizard ? { scaleY: 0.82 } : part.scaleY !== undefined ? { scaleY: part.scaleY * scale } : {}),
  }
}

export function cradleParts(shape: CradleShape, back: Part[], head: Part[], front: Part[], garment: Part | null, skin?: string, shirtDye?: Pick<Part, 'color' | 'metallic'>): Part[] {
  return [
    ...back.map(atHead),
    garment && FABRIC[garment.src]
      ? { src: shape.src, clip: [shape.body, NECK], color: skin, ref: 111 }
      : { src: shape.src, clip: shape.body, ref: 141, ...shirtDye },
    ...head.map((part) => ({ ...atHead(part), clip: HEAD })),
    ...(garment ? [{ ...garment, scale: 1.02, scaleY: 1.16, dx: 0, dy: -30, clip: shape.shirt }] : []),
    ...front.map(atHead),
    { src: shape.src, clip: shape.contact },
    ...(skin ? [{ src: shape.src, clip: shape.arms, color: skin, ref: 111 }] : []),
    ...sleeveParts(shape.sleeves, garment),
  ]
}
