import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CheckCircle2, Loader2, Mail, Send, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchBusinessContacts, fetchEmailTemplates, sendColdEmail } from '../lib/api.js'

function fillTemplateText(template = '', values = {}) {
  return String(template).replace(/{{(.*?)}}/g, (_, key) => values[key.trim()] ?? '')
}

function FieldLabel({ children }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#6b6b8a' }}>
      {children}
    </span>
  )
}

export function EmailModal({ open, onClose, business, painPointSummary }) {
  const [templates, setTemplates] = useState([])
  const [templateId, setTemplateId] = useState('general_002')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('TariqLaw Team')
  const [senderPhone, setSenderPhone] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(''); setSent(false)
    setRecipientEmail(business?.primaryEmail || '')
    setRecipientName(''); setCustomSubject(''); setCustomBody('')
  }, [open, business])

  useEffect(() => {
    if (!open || !business?.website || business?.primaryEmail) return
    ;(async () => {
      try {
        const res = await fetchBusinessContacts({ website: business.website })
        if (res?.emails?.length) setRecipientEmail(res.primaryEmail || res.emails[0])
      } catch {}
    })()
  }, [open, business])

  useEffect(() => {
    if (!open) return
    setLoadingTemplates(true)
    ;(async () => {
      try {
        const data = await fetchEmailTemplates()
        const next = data?.templates || []
        setTemplates(next)
        if (next.length && !next.some((t) => t.id === templateId)) setTemplateId(next[0].id)
      } catch (e) {
        setError(e?.response?.data?.error || e?.message || 'Could not load templates')
      } finally {
        setLoadingTemplates(false)
      }
    })()
  }, [open, templateId])

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) || null,
    [templates, templateId],
  )

  const placeholderValues = useMemo(
    () => ({
      recipientName: recipientName || 'there',
      businessName: business?.name || '',
      businessType: business?.category || 'business',
      city: business?.city || '',
      state: business?.state || '',
      painPointSummary: painPointSummary || 'customer concerns',
      senderName,
      senderPhone,
    }),
    [recipientName, business, painPointSummary, senderName, senderPhone],
  )

  const previewSubject = customSubject || fillTemplateText(selectedTemplate?.subject || '', placeholderValues)
  const previewBody = customBody || fillTemplateText(selectedTemplate?.body || '', placeholderValues)
  const canSend = recipientEmail.trim() && (selectedTemplate || customBody.trim())

  async function handleSend() {
    setSending(true); setError('')
    try {
      await sendColdEmail({
        templateId, recipientEmail, recipientName,
        businessName: business?.name || '',
        businessType: business?.category || 'business',
        city: business?.city || '', state: business?.state || '',
        painPointSummary: painPointSummary || 'customer concerns',
        senderName, senderPhone,
        customSubject: customSubject || undefined,
        customBody: customBody || undefined,
      })
      setSent(true)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        className="fixed inset-0"
        style={{ background: 'rgba(4,4,8,0.85)', backdropFilter: 'blur(12px)' }}
      />

      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
          <DialogPanel
            className="w-full animate-fade-up rounded-2xl"
            style={{
              background: '#0e0e1a',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow: '0 0 0 1px rgba(139,92,246,0.08), 0 40px 100px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-3 px-6 py-5"
              style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
                >
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle
                    className="text-base font-semibold text-white"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    Outreach Composer
                  </DialogTitle>
                  <p className="text-[12px]" style={{ color: '#6b6b8a' }}>
                    {business?.name ? `Composing for ${business.name}` : 'Personalized cold outreach'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sent && (
                  <span
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold animate-fade-in"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7' }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sent!
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/5"
                  style={{ color: '#6b6b8a' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
              {/* Left: form */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <FieldLabel>Recipient email</FieldLabel>
                    <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="info@business.com" className="field" />
                  </label>
                  <label>
                    <FieldLabel>Recipient name</FieldLabel>
                    <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Owner or manager" className="field" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <FieldLabel>Template {loadingTemplates && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}</FieldLabel>
                    <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="field field-select">
                      {!templates.length ? (
                        <option value="">{loadingTemplates ? 'Loading…' : 'No templates'}</option>
                      ) : null}
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <FieldLabel>Sender name</FieldLabel>
                      <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className="field" />
                    </label>
                    <label>
                      <FieldLabel>Sender phone</FieldLabel>
                      <input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="(877) 845-4529" className="field" />
                    </label>
                  </div>
                </div>

                <label>
                  <FieldLabel>Subject override</FieldLabel>
                  <input value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="Leave blank to use template subject" className="field" />
                </label>

                <label>
                  <FieldLabel>Body override</FieldLabel>
                  <textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder="Leave blank to use template body"
                    rows={10}
                    className="field resize-none leading-relaxed"
                  />
                </label>
              </div>

              {/* Right: preview */}
              <div
                className="flex flex-col rounded-xl"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.12)' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                    Live Preview
                  </span>
                  <span className="text-[11px]" style={{ color: '#4a4a6a' }}>
                    Placeholders auto-filled
                  </span>
                </div>

                <div className="flex-1 space-y-4 overflow-auto p-4">
                  {[
                    { label: 'To', val: recipientEmail || 'Recipient email' },
                    { label: 'Subject', val: previewSubject || 'Subject line' },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4a4a6a' }}>{label}</div>
                      <div className="text-sm text-white">{val}</div>
                    </div>
                  ))}
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4a4a6a' }}>Body</div>
                    <pre
                      className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                      style={{ color: '#c8c8e0' }}
                    >
                      {previewBody || 'Template body will appear here'}
                    </pre>
                  </div>
                </div>

                {/* Error + actions */}
                <div className="px-4 pb-4 space-y-3">
                  {error && (
                    <div
                      className="rounded-lg px-3 py-2.5 text-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                    >
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="btn-ghost text-sm px-4 py-2">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!canSend || sending}
                      className="btn-primary text-sm px-5 py-2"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {sending ? 'Sending…' : 'Send Email'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
