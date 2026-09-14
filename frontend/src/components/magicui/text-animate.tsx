"use client"

import { ElementType } from "react"
import { motion, MotionProps, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimationType = "text" | "word" | "character" | "line"

type AnimationVariant =
  | "fadeIn"
  | "fadeInUp"
  | "popIn"
  | "shiftInUp"
  | "rollIn"
  | "blurIn"
  | "blurInUp"
  | "blurInDown"
  | "slideUp"
  | "slideDown"
  | "scaleUp"
  | "scaleDown"

export interface TextAnimateProps extends MotionProps {
  children: string
  className?: string
  segmentClassName?: string
  delay?: number
  duration?: number
  variants?: Variants
  as?: ElementType
  by?: AnimationType
  startOnView?: boolean
  once?: boolean
  animation?: AnimationVariant
}

const defaultItemAnimationVariants: Record<AnimationVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0, y: 0 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  popIn: {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  },
  shiftInUp: {
    hidden: { opacity: 0, y: "100%" },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: "100%" },
  },
  rollIn: {
    hidden: { transform: "rotateX(-90deg)", opacity: 0 },
    show: { transform: "rotateX(0deg)", opacity: 1 },
    exit: { transform: "rotateX(90deg)", opacity: 0 },
  },
  blurIn: {
    hidden: { filter: "blur(10px)", opacity: 0 },
    show: { filter: "blur(0px)", opacity: 1 },
    exit: { filter: "blur(10px)", opacity: 0 },
  },
  blurInUp: {
    hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
    show: { filter: "blur(0px)", opacity: 1, y: 0 },
    exit: { filter: "blur(10px)", opacity: 0, y: -20 },
  },
  blurInDown: {
    hidden: { filter: "blur(10px)", opacity: 0, y: -20 },
    show: { filter: "blur(0px)", opacity: 1, y: 0 },
    exit: { filter: "blur(10px)", opacity: 0, y: 20 },
  },
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  slideDown: {
    hidden: { y: -20, opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
  scaleUp: {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  scaleDown: {
    hidden: { scale: 1.2, opacity: 0 },
    show: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
}

export function TextAnimate({
  children,
  delay = 0,
  duration = 0.3,
  variants,
  className,
  segmentClassName,
  as: Component = "span",
  by = "word",
  startOnView = true,
  once = true,
  animation = "fadeIn",
  ...props
}: TextAnimateProps) {
  const itemAnimationVariants = variants || defaultItemAnimationVariants[animation]

  const stagger = by === "character" ? 0.03 : by === "word" ? 0.12 : by === "line" ? 0.15 : 0.05

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
    exit: {
      transition: {
        staggerChildren: stagger,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: {
      ...itemAnimationVariants.hidden,
      transition: { duration, ease: "easeOut" },
    },
    show: {
      ...itemAnimationVariants.show,
      transition: { duration, ease: "easeOut" },
    },
    exit: {
      ...itemAnimationVariants.exit,
      transition: { duration, ease: "easeOut" },
    },
  }

  const MotionComponent = (motion as any).create
    ? (motion as any).create(Component)
    : (motion as any)(Component)

  let segments: React.ReactNode[] = []

  if (by === "character") {
    // Preserve words so line breaks don't split words mid-character
    const words = children.split(" ")
    segments = words.map((word, wordIdx) => (
      <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
        {Array.from(word).map((char, charIdx) => (
          <motion.span
            key={`char-${charIdx}`}
            variants={itemVariants}
            className={cn("inline-block", segmentClassName)}
          >
            {char}
          </motion.span>
        ))}
        {wordIdx < words.length - 1 && (
          <span className="inline-block">&nbsp;</span>
        )}
      </span>
    ))
  } else if (by === "word") {
    const words = children.split(" ")
    segments = words.map((word, wordIdx) => (
      <span key={`word-${wordIdx}`} className="inline-block">
        <motion.span
          variants={itemVariants}
          className={cn("inline-block", segmentClassName)}
        >
          {word}
        </motion.span>
        {wordIdx < words.length - 1 && (
          <span className="inline-block">&nbsp;</span>
        )}
      </span>
    ))
  } else if (by === "line") {
    const lines = children.split("\n")
    segments = lines.map((line, lineIdx) => (
      <motion.span
        key={`line-${lineIdx}`}
        variants={itemVariants}
        className={cn("block", segmentClassName)}
      >
        {line}
      </motion.span>
    ))
  } else {
    segments = [
      <motion.span
        key="full-text"
        variants={itemVariants}
        className={cn("inline-block", segmentClassName)}
      >
        {children}
      </motion.span>,
    ]
  }

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView={startOnView ? "show" : undefined}
      animate={startOnView ? undefined : "show"}
      viewport={{ once }}
      className={cn("inline-block", className)}
      {...props}
    >
      {segments}
    </MotionComponent>
  )
}
