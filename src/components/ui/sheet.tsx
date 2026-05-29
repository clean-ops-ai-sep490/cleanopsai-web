"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const SheetContext = React.createContext<{ open: boolean }>({ open: false })

function Sheet({ open, onOpenChange, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false)
  const activeOpen = open !== undefined ? open : isOpen

  const handleOpenChange = (val: boolean) => {
    if (open === undefined) {
      setIsOpen(val)
    }
    onOpenChange?.(val)
  }

  return (
    <SheetContext.Provider value={{ open: activeOpen }}>
      <SheetPrimitive.Root data-slot="sheet" open={activeOpen} onOpenChange={handleOpenChange} {...props} />
    </SheetContext.Provider>
  )
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      asChild
      {...props}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    </SheetPrimitive.Overlay>
  )
}

const getMotionProps = (side: "top" | "right" | "bottom" | "left") => {
  const transitions = {
    type: "spring",
    damping: 30,
    stiffness: 300,
  } as const

  switch (side) {
    case "left":
      return {
        initial: { x: "-100%" },
        animate: { x: 0 },
        exit: { x: "-100%" },
        transition: transitions,
      }
    case "top":
      return {
        initial: { y: "-100%" },
        animate: { y: 0 },
        exit: { y: "-100%" },
        transition: transitions,
      }
    case "bottom":
      return {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: transitions,
      }
    case "right":
    default:
      return {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: transitions,
      }
  }
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const { open } = React.useContext(SheetContext)
  const motionProps = getMotionProps(side)
  const isHorizontal = side === "left" || side === "right"

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal forceMount>
          <SheetOverlay forceMount />
          <SheetPrimitive.Content
            data-slot="sheet-content"
            data-side={side}
            className={cn(
              "fixed z-50 flex flex-col gap-4 bg-background bg-clip-padding text-sm shadow-lg data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b",
              isHorizontal && "sm:max-w-md",
              className
            )}
            forceMount
            asChild
            {...props}
          >
            <motion.div {...motionProps} className="h-full flex flex-col">
              {children}
              {showCloseButton && (
                <SheetPrimitive.Close data-slot="sheet-close" asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-3 right-3 rounded-full hover:bg-slate-100 transition-colors h-8 w-8 p-0"
                    size="icon-sm"
                  >
                    <XIcon className="h-4 w-4 text-slate-400" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetPrimitive.Close>
              )}
            </motion.div>
          </SheetPrimitive.Content>
        </SheetPortal>
      )}
    </AnimatePresence>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
