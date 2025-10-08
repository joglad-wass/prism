'use client'

import { Brand } from '../../types'
import { Building, DollarSign, FileText, User } from 'lucide-react'

interface BrandProfessionalDetailsProps {
  brand: Brand
}

export function BrandProfessionalDetails({ brand }: BrandProfessionalDetailsProps) {
  const professionalDetails = [
    {
      icon: Building,
      label: 'Industry',
      value: brand.industry,
      show: !!brand.industry
    },
    {
      icon: DollarSign,
      label: 'Currency',
      value: brand.currency,
      show: !!brand.currency
    },
    {
      icon: FileText,
      label: 'Legal Name',
      value: brand.legalName,
      show: !!brand.legalName && brand.legalName !== brand.name
    },
    {
      icon: User,
      label: 'Owner',
      value: brand.owner?.name,
      show: !!brand.owner?.name
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {professionalDetails
        .filter(detail => detail.show)
        .map((detail, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <detail.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {detail.label}:
            </span>
            <span className="text-xs font-semibold">{detail.value}</span>
          </div>
        ))}
    </div>
  )
}
