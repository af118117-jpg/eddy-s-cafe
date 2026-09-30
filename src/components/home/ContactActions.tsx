import { MapPin, MessageCircle, Phone } from 'lucide-react'
import { Button, type ButtonSize } from '@/components/ui'
import { cafe } from '@/data'

/** Call, WhatsApp (once the number is confirmed) and Directions. */
export function ContactActions({ size = 'lg' }: { size?: ButtonSize }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        href={cafe.phone.href}
        size={size}
        icon={Phone}
        iconPosition="start"
        aria-label={`Call ${cafe.name}`}
      >
        Call
      </Button>
      {cafe.whatsapp && (
        <Button
          href={cafe.whatsapp.href}
          variant="secondary"
          size={size}
          icon={MessageCircle}
          iconPosition="start"
          aria-label={`WhatsApp ${cafe.name}`}
        >
          WhatsApp
        </Button>
      )}
      <Button
        href={cafe.links.directions}
        variant="secondary"
        size={size}
        icon={MapPin}
        iconPosition="start"
      >
        Get directions
      </Button>
    </div>
  )
}
