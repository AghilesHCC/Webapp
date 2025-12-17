import { Check, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import type { Step } from './types'

interface StepIndicatorProps {
  currentStep: number
}

const steps: Step[] = [
  { number: 1, title: 'Espace', icon: MapPin },
  { number: 2, title: 'Date & Heure', icon: Calendar },
  { number: 3, title: 'Confirmation', icon: CheckCircle2 }
]

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const IconComponent = step.icon
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-accent text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium mt-2 ${
                    currentStep >= step.number ? 'text-accent' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 -mt-6 rounded transition-all duration-300 ${
                    currentStep > step.number ? 'bg-accent' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator
