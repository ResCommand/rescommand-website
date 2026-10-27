import { forwardRef } from 'react'
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full min-h-[48px] rounded border border-line bg-white px-3.5 py-3 text-[16px] text-ink placeholder:text-grey-light transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10'

interface LabelWrapProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

function LabelWrap({ id, label, required, error, children }: LabelWrapProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
        {required && (
          <span className="text-grey-light" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-small text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, error, id, required, className, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <LabelWrap id={fieldId!} label={label} required={required} error={error}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, error && 'border-danger', className)}
        {...props}
      />
    </LabelWrap>
  )
})

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { label, error, id, required, options, className, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <LabelWrap id={fieldId!} label={label} required={required} error={error}>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, error && 'border-danger', className)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </LabelWrap>
  )
})

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
  { label, error, id, required, className, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <LabelWrap id={fieldId!} label={label} required={required} error={error}>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, 'min-h-[120px] resize-y', error && 'border-danger', className)}
        {...props}
      />
    </LabelWrap>
  )
})
