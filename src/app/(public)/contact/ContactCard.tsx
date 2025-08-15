import { Card, CardContent } from "@/components/ui/card"
import { Mail, User } from "lucide-react"
import Obfuscate from "react-obfuscate"
import clsx from "clsx"

interface ContactCardProps {
  title: string
  fullName: string
  email: string
  imageAlt?: string
  id?: string
  highlight?: boolean
}

export default function ContactCard({ title, fullName, email, imageAlt, id, highlight }: ContactCardProps) {
  return (
    <Card
      id={id}
      className={clsx(
        "w-full max-w-md hover:shadow-md transition-shadow duration-200 scroll-mt-40",
        highlight && "animate-[flash_1.5s]"
      )}
      // Tailwind custom animation, see below for keyframes
      style={{
        ...(highlight
          ? {
            animation: "flash 2s",
          }
          : {}),
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Image Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
              {imageAlt && <span className="sr-only">{imageAlt}</span>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                {title}
              </p>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
                <span className="text-lg font-semibold text-foreground whitespace-nowrap block">
                  {fullName}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <Obfuscate
                  email={email}
                  style={{ textDecoration: "underline", color: "inherit", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <style jsx global>{`
        @keyframes flash {
          0% { box-shadow: 0 0 0 0 #facc15; }
          10% { box-shadow: 0 0 0 4px #facc15; }
          20% { box-shadow: 0 0 0 8px #fde68a; }
          40% { box-shadow: 0 0 0 8px #fde68a; }
          60% { box-shadow: 0 0 0 4px #facc15; }
          80% { box-shadow: 0 0 0 0 #facc15; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
      `}</style>
    </Card>
  )
}
