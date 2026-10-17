
import { useEffect, useRef } from "react"

type Star = {
  x: number
  y: number
  z: number
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let animationId = 0
    let lastTime = 0

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const pointer = { x: 0, y: 0 }
    const targetPointer = { x: 0, y: 0 }

    const starCount = 450
    const stars: Star[] = []

    const randomStar = (): Star => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 0.95 + 0.05,
    })

    for (let i = 0; i < starCount; i++) {
      stars.push(randomStar())
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      width = rect.width
      height = rect.height

      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(0)
    }

    function draw(delta: number) {
      ctx!.clearRect(0, 0, width, height)

      const cx = width / 2 + pointer.x * 18
      const cy = height / 2 + pointer.y * 18
      const scale = Math.min(width, height) * 0.48

      for (const star of stars) {
        if (!reduceMotion) {
          star.z -= delta * 0.00013

          if (star.z <= 0.025) {
            Object.assign(star, randomStar())
            star.z = 1
          }
        }

        const px = cx + (star.x / star.z) * scale
        const py = cy + (star.y / star.z) * scale

        if (
          px < -20 ||
          px > width + 20 ||
          py < -20 ||
          py > height + 20
        ) {
          continue
        }

        const radius = Math.max(0.45, (1 - star.z) * 2.1)
        const opacity = Math.min(1, (1 - star.z) * 1.3 + 0.15)
        const isDarkMode = document.documentElement.classList.contains("dark")

        // Soft, cool-white star glow
        ctx!.beginPath()
        ctx!.fillStyle = isDarkMode
            ? `rgba(220, 230, 255, ${opacity})`
            : `rgba(15, 23, 42, ${opacity})`
        ctx!.arc(px, py, radius, 0, Math.PI * 2)
        ctx!.fill()

        // Subtle cinematic motion trails
        if (!reduceMotion && star.z < 0.45) {
          const oldZ = Math.min(
            1,
            star.z + delta * 0.00013
          )
          const oldX = cx + (star.x / oldZ) * scale
          const oldY = cy + (star.y / oldZ) * scale

          ctx!.beginPath()
          ctx!.moveTo(oldX, oldY)
          ctx!.lineTo(px, py)
          ctx!.strokeStyle = isDarkMode
            ? `rgba(190, 210, 255, ${opacity * 0.32})`
            : `rgba(15, 23, 42, ${opacity * 0.22})`
          ctx!.lineWidth = radius * 0.65
          ctx!.stroke()
        }
      }
    }

    function animate(time: number) {
      const delta = lastTime
        ? Math.min(time - lastTime, 40)
        : 16

      lastTime = time

      pointer.x += (targetPointer.x - pointer.x) * 0.04
      pointer.y += (targetPointer.y - pointer.y) * 0.04

      draw(delta)

      if (!reduceMotion) {
        animationId = requestAnimationFrame(animate)
      }
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) return

      targetPointer.x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2

      targetPointer.y =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }

    function onPointerLeave() {
      targetPointer.x = 0
      targetPointer.y = 0
    }

    // Listen on the parent because the canvas itself doesn't
    // intercept pointer events.
    const interactionTarget = canvas.parentElement

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    if (interactionTarget) {
      interactionTarget.addEventListener(
        "pointermove",
        onPointerMove
      )
      interactionTarget.addEventListener(
        "pointerleave",
        onPointerLeave
      )
    }

    resize()

    if (!reduceMotion) {
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()

      if (interactionTarget) {
        interactionTarget.removeEventListener(
          "pointermove",
          onPointerMove
        )
        interactionTarget.removeEventListener(
          "pointerleave",
          onPointerLeave
        )
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 block h-full w-full"
      style={{ mixBlendMode: "difference" }}
    />
  )
}
