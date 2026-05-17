import { useEffect, useMemo, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import Step1Personal from '../components/steps/Step1Personal'
import Step2Education from '../components/steps/Step2Education'
import Step3Research from '../components/steps/Step3Research'
import Step4Role from '../components/steps/Step4Role'
import Step5About from '../components/steps/Step5About'
import Step6Contact from '../components/steps/Step6Contact'
import Step7Photo from '../components/steps/Step7Photo'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { submitMemberProfile } from '../lib/memberService'

const INITIAL_FORM_STATE = {
  full_name: '',
  preferred_name: '',
  title: '',
  designation: '',
  department: '',
  experience_years: '',
  languages: '',
  degree_1: '',
  field_1: '',
  institution_1: '',
  year_1: '',
  degree_2: '',
  field_2: '',
  institution_2: '',
  year_2: '',
  degree_3: '',
  field_3: '',
  institution_3: '',
  year_3: '',
  certifications: '',
  research_primary: '',
  research_secondary: '',
  research_keywords: '',
  publications: '',
  patents: '',
  academic_affiliations: '',
  project_role: '',
  responsibilities: ['', ''],
  govt_experience: '',
  notable_projects: '',
  bio: '',
  unique_qualification: '',
  email: '',
  phone: '',
  linkedin: '',
  researchgate: '',
  website: '',
}

const STEP_COMPONENTS = [
  Step1Personal,
  Step2Education,
  Step3Research,
  Step4Role,
  Step5About,
  Step6Contact,
  Step7Photo,
]

const STEP_TITLES = [
  'Personal',
  'Education',
  'Research',
  'Role',
  'About',
  'Contact',
  'Photo',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function FormPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState({})
  const [toasts, setToasts] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  const CurrentStep = useMemo(() => STEP_COMPONENTS[step - 1], [step])

  const addToast = (message) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2800)
  }

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    },
    [photoPreview],
  )

  const getStepErrors = (stepNumber, state) => {
    const next = {}
    if (stepNumber === 1) {
      if (!state.full_name.trim()) next.full_name = 'Full name is required.'
      if (!state.designation.trim()) next.designation = 'Designation is required.'
      if (!state.department.trim()) next.department = 'Department is required.'
    }

    if (stepNumber === 2) {
      if (!state.degree_1.trim()) next.degree_1 = 'Degree is required.'
      if (!state.field_1.trim()) next.field_1 = 'Field is required.'
      if (!state.institution_1.trim()) next.institution_1 = 'Institution is required.'
    }

    if (stepNumber === 4) {
      if (!state.project_role.trim()) next.project_role = 'Project role is required.'
      const nonEmptyResponsibilities = state.responsibilities
        .map((item) => item.trim())
        .filter(Boolean)
      if (nonEmptyResponsibilities.length < 2) {
        next.responsibilities = 'Add at least two responsibilities.'
      }
    }

    if (stepNumber === 5) {
      if (!state.bio.trim()) next.bio = 'Professional bio is required.'
    }

    if (stepNumber === 6) {
      if (!state.email.trim()) {
        next.email = 'Official email is required.'
      } else if (!EMAIL_REGEX.test(state.email.trim())) {
        next.email = 'Please enter a valid email address.'
      }
    }

    return next
  }

  const validateCurrentStep = (stepNumber) => {
    const stepErrors = getStepErrors(stepNumber, formData)
    const hasErrors = Object.keys(stepErrors).length > 0

    if (hasErrors) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      addToast(Object.values(stepErrors)[0])
      return false
    }

    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(getStepErrors(stepNumber, INITIAL_FORM_STATE)).forEach((key) => {
        delete next[key]
      })
      return next
    })
    return true
  }

  const validateAll = () => {
    const stepsWithValidation = [1, 2, 4, 5, 6]
    const allErrors = {}
    let firstInvalidStep = null

    stepsWithValidation.forEach((stepNumber) => {
      const stepErrors = getStepErrors(stepNumber, formData)
      if (Object.keys(stepErrors).length && !firstInvalidStep) {
        firstInvalidStep = stepNumber
      }
      Object.assign(allErrors, stepErrors)
    })

    setErrors(allErrors)
    if (firstInvalidStep) {
      setStep(firstInvalidStep)
      addToast(Object.values(allErrors)[0])
      return false
    }
    return true
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleResponsibilityChange = (index, value) => {
    const next = [...formData.responsibilities]
    next[index] = value
    setFormData((prev) => ({ ...prev, responsibilities: next }))
    setErrors((prev) => ({ ...prev, responsibilities: undefined }))
  }

  const handleAddResponsibility = () => {
    if (formData.responsibilities.length >= 8) {
      addToast('You can add up to 8 responsibilities only.')
      return
    }
    setFormData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ''],
    }))
  }

  const handleRemoveResponsibility = (index) => {
    if (formData.responsibilities.length <= 2) {
      addToast('At least 2 responsibilities are required.')
      return
    }

    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handlePhotoSelect = (file) => {
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      addToast('Only JPG and PNG files are accepted.')
      setErrors((prev) => ({ ...prev, photo_url: 'Please upload JPG or PNG image.' }))
      return
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview)

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, photo_url: undefined }))
  }

  const handleNext = () => {
    if (!validateCurrentStep(step)) return
    setStep((prev) => Math.min(prev + 1, 7))
  }

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    if (!validateAll()) return
    setIsSubmitting(true)

    try {
      await submitMemberProfile(formData, photoFile)
      setSubmittedName([formData.title, formData.full_name].filter(Boolean).join(' '))
      setIsSuccess(true)
    } catch (error) {
      addToast(error?.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldClass = (field) =>
    `h-11 w-full rounded-md border bg-white px-3 text-sm text-[var(--text)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 ${
      errors[field] ? 'border-[var(--red)]' : 'border-[var(--border)]'
    }`

  if (isSuccess) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-6 md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--green)] text-[var(--green)]">
          <svg viewBox="0 0 20 20" className="h-8 w-8" aria-hidden="true">
            <path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mt-5 text-center font-heading text-4xl text-[var(--navy)]">Thank you for your submission</h2>
        <p className="mt-2 text-center text-base text-[var(--text)]">
          {submittedName} has been added to the ministry presentation collection queue.
        </p>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">You may close this page.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-white p-5 md:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.08em] text-[var(--muted)]">Team Member Submission Form</p>
        <h2 className="font-heading text-4xl text-[var(--navy)]">Ministry Research Portfolio Intake</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Complete all required sections. You cannot skip steps to preserve profile consistency.
        </p>
      </div>

      <ProgressBar step={step} />
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        {STEP_TITLES.map((label, index) => (
          <span
            key={label}
            className={`rounded-full border px-2.5 py-1 ${
              index + 1 === step
                ? 'border-[var(--gold)] text-[var(--navy)]'
                : 'border-[var(--border)] text-[var(--muted)]'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <CurrentStep
          data={formData}
          onChange={handleChange}
          onResponsibilityChange={handleResponsibilityChange}
          onAddResponsibility={handleAddResponsibility}
          onRemoveResponsibility={handleRemoveResponsibility}
          onFileSelect={handlePhotoSelect}
          previewUrl={photoPreview}
          getFieldClass={(field) =>
            field === 'photo_url'
              ? errors.photo_url
                ? 'border-[var(--red)]'
                : ''
              : field.includes('publications') ||
                  field.includes('patents') ||
                  field.includes('affiliations') ||
                  field.includes('certifications') ||
                  field.includes('bio') ||
                  field.includes('qualification') ||
                  field.includes('govt_experience') ||
                  field.includes('notable_projects')
                ? `${getFieldClass(field)} h-auto py-2`
                : getFieldClass(field)
          }
          errors={errors}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--gray)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
        >
          Back
        </button>

        {step < 7 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-4 text-sm font-semibold text-[var(--white)] transition hover:bg-[var(--navy2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--green)] bg-[var(--green)] px-4 text-sm font-semibold text-[var(--white)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            {isSubmitting ? <Spinner label="Submitting..." /> : 'Submit Profile'}
          </button>
        )}
      </div>

      <Toast toasts={toasts} />
    </section>
  )
}

export default FormPage
