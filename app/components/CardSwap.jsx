"use client"

import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

/** @type {React.ForwardRefExoticComponent<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement> & { customClass?: string }> & React.RefAttributes<HTMLDivElement>>} */
export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total, dir = 1) => ({
  x: i * distX * dir,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});
const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick = /** @type {(index: number, isFront: boolean) => void} */ (undefined),
  skewAmount = 6,
  easing = 'elastic',
  className = '',
  direction = 'right',
  children
}) => {
  const dir = direction === 'left' ? -1 : 1;
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);
  const promoteRef = useRef(() => {});

  useEffect(() => {
    const total = refs.length;

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;

      // Reorder immediately, not at the end of the animation. The old
      // front card is already visually leaving and the new one already
      // sliding in the moment this runs, so click/hover front-checks
      // need to reflect that right away, not ~2s later once the
      // animation timeline finishes.
      order.current = [...rest, front];

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length, dir);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length, dir);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

    };

    const hoverHandlers = [];

    refs.forEach((r, i) => {
      placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total, dir), skewAmount);

      if (!pauseOnHover) return;
      const el = r.current;
      if (!el) return;

      // Only the card currently in front reacts to hover. Hovering any
      // other (back) card does nothing here - they're click-only.
      //
      // Rather than pausing the animation wherever it happens to be
      // mid-flight (which can leave cards visually misaligned for a
      // beat), hovering kills any in-flight tween and snaps every card
      // cleanly to its correct resting slot for the current order. This
      // guarantees the stack always looks settled and aligned while
      // paused - nothing left stuck mid-transition.
      const settleToOrder = () => {
        order.current.forEach((cardIdx, slotIndex) => {
          const cardEl = refs[cardIdx].current;
          if (!cardEl) return;
          const slot = makeSlot(slotIndex, cardDistance, verticalDistance, total, dir);
          gsap.killTweensOf(cardEl, 'x,y,z,zIndex');
          gsap.to(cardEl, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            zIndex: slot.zIndex,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      };

      const onEnter = () => {
        if (order.current[0] !== i) return;
        clearInterval(intervalRef.current);
        tlRef.current?.kill();
        settleToOrder();
      };
      const onLeave = () => {
        if (order.current[0] !== i) return;
        clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(swap, delay);
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      hoverHandlers.push({ el, onEnter, onLeave });
    });

    // Clicking a card that isn't already in front promotes it to front,
    // shifting the rest back by one slot each while keeping their
    // relative order. Cards already in front are a no-op.
    const promote = idx => {
      const current = order.current;
      const pos = current.indexOf(idx);
      if (pos <= 0) return;

      const rest = current.filter(v => v !== idx);
      const newOrder = [idx, ...rest];
      order.current = newOrder;

      tlRef.current?.kill();
      clearInterval(intervalRef.current);

      newOrder.forEach((cardIdx, slotIndex) => {
        const el = refs[cardIdx].current;
        if (!el) return;
        const slot = makeSlot(slotIndex, cardDistance, verticalDistance, total, dir);
        gsap.killTweensOf(el, 'x,y,z,zIndex');
        gsap.to(el, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          zIndex: slot.zIndex,
          duration: 0.5,
          ease: 'power2.out'
        });
      });

      intervalRef.current = window.setInterval(swap, delay);
    };
    promoteRef.current = promote;

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    return () => {
      hoverHandlers.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, direction]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            const isFront = order.current[0] === i;
            if (!isFront) {
              // Clicking a back card only promotes it to front.
              e.preventDefault();
              e.stopPropagation();
            }
            child.props.onClick?.(e);
            onCardClick?.(i, isFront);
            promoteRef.current(i);
          }
        })
      : child
  );

  return (
    <div ref={container} className={`card-swap-container ${className}`.trim()} style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;