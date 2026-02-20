import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function Privacy() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '1': true,
  })

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const sections = [
    {
      id: '1',
      title: '1. Introduction',
      content:
        'Cartivo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and related services.',
    },
    {
      id: '2',
      title: '2. Information We Collect',
      content:
        'We collect information in several ways:\n\n• Account Information: Name, email address, password, and other details you provide during registration\n• Shopping Data: Products viewed, purchased, preferences, and browsing history\n• Payment Information: Processed securely through third-party payment processors\n• Device Information: IP address, browser type, operating system, and device identifiers\n• Location Data: Approximate location based on IP address (with your consent)\n• AI Interaction Data: Your interactions with our AI assistant and voice features\n• Usage Data: How you interact with our platform, pages visited, and time spent',
    },
    {
      id: '3',
      title: '3. How We Use Your Information',
      content:
        'We use the information we collect to:\n\n• Provide and improve our Services\n• Personalize your shopping experience using AI\n• Send you product recommendations and marketing communications (with consent)\n• Process transactions and send related information\n• Respond to your inquiries and provide customer support\n• Comply with legal obligations\n• Detect and prevent fraudulent activity\n• Analyze trends and gather demographic information to improve our platform\n• Develop new products and features',
    },
    {
      id: '4',
      title: '4. Data Security',
      content:
        'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.',
    },
    {
      id: '5',
      title: '5. Third-Party Services',
      content:
        'We may share your information with third-party service providers who assist us in operating our website and conducting our business, including:\n\n• Payment processors (for secure transaction processing)\n• Analytics providers (to understand how users interact with our platform)\n• AI service providers (for recommendations and voice features)\n• Shipping and delivery partners\n• Customer service platforms\n\nThese third parties are contractually obligated to use your information only as necessary to provide services to us.',
    },
    {
      id: '6',
      title: '6. Your Privacy Rights',
      content:
        'Depending on your location, you may have the following rights:\n\n• Right to Access: Request a copy of your personal data\n• Right to Rectification: Correct inaccurate or incomplete information\n• Right to Erasure: Request deletion of your data ("right to be forgotten")\n• Right to Restrict Processing: Limit how we use your data\n• Right to Data Portability: Receive your data in a portable format\n• Right to Object: Opt-out of certain data processing activities\n• Right to Withdraw Consent: Withdraw consent at any time\n\nTo exercise these rights, contact us at privacy@cartivo.com',
    },
    {
      id: '7',
      title: '7. Cookies and Tracking Technologies',
      content:
        'We use cookies, web beacons, and similar tracking technologies to enhance your experience, remember your preferences, and understand how you use our platform. You can control cookie settings through your browser preferences, though some features may not function properly if cookies are disabled.',
    },
    {
      id: '8',
      title: '8. Children\'s Privacy',
      content:
        'Our Services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete such information and terminate the child\'s account. If you believe we have collected information from a child under 13, please contact us immediately.',
    },
    {
      id: '9',
      title: '9. AI and Personalization',
      content:
        'Cartivo uses artificial intelligence to provide personalized recommendations, voice assistance, and visual try-on features. Your interaction data with these AI features is used to:\n\n• Improve recommendation accuracy\n• Train and improve our AI models\n• Provide better personalized experiences\n\nYou can opt-out of AI-based personalization in your account settings at any time.',
    },
    {
      id: '10',
      title: '10. International Data Transfers',
      content:
        'If you are accessing our Services from outside the country where our servers are located, your information may be transferred to and processed in that country. By using Cartivo, you consent to the transfer of your information to countries outside your country of residence.',
    },
    {
      id: '11',
      title: '11. Policy Changes',
      content:
        'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or other factors. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of our Services after such notice constitutes your acceptance of the updated Privacy Policy.',
    },
    {
      id: '12',
      title: '12. Contact Us',
      content:
        'If you have any questions about this Privacy Policy or our privacy practices, please contact us at:\n\nCartivo Privacy Team\nEmail: privacy@cartivo.com\nOr use the contact form on our website',
    },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-6 sm:px-12 lg:px-24 py-12 border-b border-slate-200/50 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-slate-600">
              We respect your privacy and are committed to transparent data practices
            </p>
            <p className="text-sm text-slate-500 mt-3">Last updated: February 20, 2026</p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-6 sm:px-12 lg:px-24 py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 text-left">{section.title}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedSections[section.id] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedSections[section.id] ? 'auto' : 0,
                      opacity: expandedSections[section.id] ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <p className="px-6 py-4 text-slate-600 whitespace-pre-line">{section.content}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* GDPR Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-12 bg-emerald-50 rounded-xl border border-emerald-200 p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-3">GDPR & Privacy Laws</h2>
              <p className="text-slate-600 mb-3">
                We comply with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA),
                and other applicable privacy laws. If you have rights under these regulations, please contact our
                privacy team.
              </p>
              <p className="text-sm text-slate-600">
                <strong>Data Protection Officer:</strong>{' '}
                <a href="mailto:dpo@cartivo.com" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  dpo@cartivo.com
                </a>
              </p>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-6 bg-indigo-50 rounded-xl border border-indigo-200 p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-3">Questions About Our Privacy Practices?</h2>
              <p className="text-slate-600">
                Contact our Privacy Team at{' '}
                <a href="mailto:privacy@cartivo.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  privacy@cartivo.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
