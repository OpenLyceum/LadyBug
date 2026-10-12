# Model - Lady Bug

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation teaches **two-dimensional kinematics** through the motion of a ladybug in a flat
play area. Students choose which quantity to control — **position**, **velocity**, or
**acceleration** — and observe the other two as on-screen vectors, building intuition for how the
three relate. Motion can be driven by dragging the bug, by a **remote-control pad** that sets the
active vector, or by automated **presets** (linear, circular, or elliptical paths).

The bug's path can be traced (line or dots), and the entire motion can be **recorded** and
**played back** with a timeline scrubber so students compare what they felt while driving with
what the vectors show afterward.

This is a port of PhET's *Ladybug Motion 2D*. It is **not** *Ladybug Revolution*: there is **no
rotatable platform**. The only rotation in the model is the ladybug's **heading** (it turns to
face its velocity) and the geometry of the circular-motion preset, which moves the bug around a
fixed ring (small, medium, or large) centered on a flower at the origin.

Key ideas a student should take away:

- Position, velocity, and acceleration are linked, but which one you "set" determines how the
  others are found (direct placement vs. integration vs. differentiation).
- Velocity and acceleration vectors are **estimated** from recent position history when position
  is the driving quantity, so they **lag slightly** after sharp manual moves — by design, to
  smooth noise.
- Preset motions illustrate constant-speed straight travel, uniform circular motion, and
  elliptical paths without the student having to integrate by hand.

## Quantities and units

The play area uses **centimeters** as the displayed length unit (a 5 cm scene diameter). Time is
in **seconds**.

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Position | **r** = (x, y) | cm | Location in the plane; origin at the play-area center (the flower); shown as a vector arrow from the origin |
| Velocity | **v** = (vₓ, v_y) | cm/s | Rate of change of position; shown as a vector arrow |
| Acceleration | **a** = (aₓ, a_y) | cm/s² | Rate of change of velocity; shown as a vector arrow |
| Speed | \|**v**\| | cm/s | Magnitude of velocity |
| Heading | θ | rad | Angle the ladybug faces; updates only when speed exceeds a tiny threshold |
| Time | t | s | Simulation clock; recording capped at 20 s |

## Governing equations

The ladybug obeys the standard kinematic chain:

```
v = dr/dt        a = dv/dt
```

**When velocity or acceleration drives motion**, the model integrates forward each fixed step Δt:

```
r ← r + v · Δt                    (velocity mode)
v ← v + a · Δt ,  r ← r + v · Δt   (acceleration mode)
```

**When position drives motion**, the student sets position directly (drag or remote pad). Velocity
and acceleration are **not** integrated from forces; they are **differentiated** from a rolling
window of recent position samples, with extra smoothing so the displayed vectors match the feel of
the original PhET sim.

**Automated presets** bypass manual control:

- **Linear** — constant speed along the current heading; the bug **reflects** off the square
  scene boundary (elastic bounce).
- **Circular** — uniform circular motion at a calibrated angular rate ω around a ring centered on
  the origin. The ring is **Small / Medium / Large** (0.7, 1.4, 2.1 cm — a 1 : 2 : 3 ratio).
  Because ω is the same for every ring, the period is the same, and speed v = ωr and centripetal
  acceleration a = ω²r = v²/r both scale **1 : 2 : 3** — easy to compare side by side. The
  position vector points outward from the flower, velocity is tangent, and acceleration points
  back toward the flower (antiparallel to position). Switching size mid-motion walks the bug
  radially to the new ring before it resumes circling.
- **Elliptical** — parametric motion on a fixed ellipse (semi-axes 2 cm and 1.4 cm).

## Control modes and record/playback

| Mode | Student sets | Model derives |
|---|---|---|
| Position | **r** (drag / pad) | **v**, **a** by smoothed differentiation |
| Velocity | **v** (pad) | **r** by integration; **a** by differentiation |
| Acceleration | **a** (pad) | **v** and **r** by integration |

While **recording**, each step appends state to a history buffer and advances time. When
recording stops (manually or at the 20 s cap), playback applies stored states at the scrubber
time — physics is not re-run during playback.

## Simplifications and assumptions

- **Pure kinematics** — no forces, mass, friction, or Newton's laws; motion is prescribed, not
  caused by interactions.
- **Point particle** — the ladybug graphic has no size in the physics; collision with walls is
  only implemented for the linear preset (bounce). Manual dragging can place the bug outside the
  nominal scene bounds; the view indicates when that happens.
- **No rotatable platform** — unlike *Ladybug Revolution*, the coordinate frame never spins
  under the bug.
- **Smoothed derivatives** — position-mode velocity and acceleration lag sharp turns slightly;
  this matches the pedagogical trade-off in the PhET original (readable vectors vs. instant
  response).
- **Fixed internal timestep** (~30 Hz) — all tuned preset speeds and derivative scaling assume
  this step; display frame rate does not change the physics speed.

## References

- Two-dimensional kinematics, any introductory mechanics text (e.g. Halliday, Resnick & Walker,
  *Fundamentals of Physics*, Ch. 4).
- PhET Interactive Simulations, [*Ladybug Motion 2D*](https://phet.colorado.edu/en/simulations/ladybug-motion-2d)
  (University of Colorado) — original Java simulation this port reimplements.
